package ibc_testing

import (
	"encoding/json"
	"fmt"
	"testing"

	clienttypes "github.com/cosmos/ibc-go/v8/modules/core/02-client/types"
	ibctesting "github.com/cosmos/ibc-go/v8/testing"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"

	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/cometbft/cometbft/abci/types"
	tmencoding "github.com/cometbft/cometbft/crypto/encoding"
	tmtypes "github.com/cometbft/cometbft/types"

	testutil "github.com/cosmos/interchain-security/v5/testutil/integration"
	consumerkeeper "github.com/cosmos/interchain-security/v5/x/ccv/consumer/keeper"
	providertypes "github.com/cosmos/interchain-security/v5/x/ccv/provider/types"
	ccvtypes "github.com/cosmos/interchain-security/v5/x/ccv/types"
)

type (
	AppIniter       func() (ibctesting.TestingApp, map[string]json.RawMessage)
	ValSetAppIniter func([]types.ValidatorUpdate) AppIniter
)

// Contains generic setup code for running integration tests against a provider, consumer,
// and/or democracy consumer app.go implementation. You should not need to modify or replicate this file
// to run integration tests against your app.go implementations!

var (
	FirstConsumerChainID string
	provChainID          string
	democConsumerChainID string
)

func init() {
	// Disable revision format
	ibctesting.ChainIDSuffix = ""
	FirstConsumerChainID = ibctesting.GetChainID(2)
	provChainID = ibctesting.GetChainID(1)
	democConsumerChainID = ibctesting.GetChainID(5000)
}

// ConsumerBundle serves as a way to store useful in-mem consumer app chain state
// and relevant IBC paths in the context of CCV integration testing.
type ConsumerBundle struct {
	Chain        *ibctesting.TestChain
	App          testutil.ConsumerApp
	Path         *ibctesting.Path
	TransferPath *ibctesting.Path
}

// GetCtx returns the context for the ConsumerBundle
func (cb ConsumerBundle) GetCtx() sdk.Context {
	return cb.Chain.GetContext()
}

// GetKeeper returns the keeper for the ConsumerBundle
func (cb ConsumerBundle) GetKeeper() consumerkeeper.Keeper {
	return cb.App.GetConsumerKeeper()
}

// AddProvider adds a new provider chain to the coordinator and returns the test chain and app type
func AddProvider[T testutil.ProviderApp](t *testing.T, coordinator *ibctesting.Coordinator, appIniter AppIniter) (
	*ibctesting.TestChain, T,
) {
	t.Helper()
	ibctesting.DefaultTestingAppInit = appIniter
	provider := ibctesting.NewTestChain(t, coordinator, provChainID)
	coordinator.Chains[provChainID] = provider

	providerToReturn, ok := provider.App.(T)
	if !ok {
		panic(fmt.Sprintf("provider app type returned from app initer does not match app type passed in as type param: %T, %T",
			provider.App, *new(T)))
	}
	return provider, providerToReturn
}

// AddDemocracyConsumer adds a new democ consumer chain to the coordinator and returns the test chain and app type
func AddDemocracyConsumer[T testutil.DemocConsumerApp](
	coordinator *ibctesting.Coordinator,
	s *suite.Suite,
	appIniter ValSetAppIniter,
) (*ibctesting.TestChain, T) {
	s.T().Helper()

	// generate validators private/public key
	valSet, valUpdates, signers, err := testutil.CreateValidators(4, "")
	require.NoError(s.T(), err)

	ibctesting.DefaultTestingAppInit = appIniter(valUpdates)
	democConsumer := ibctesting.NewTestChainWithValSet(s.T(), coordinator, democConsumerChainID, valSet, signers)
	coordinator.Chains[democConsumerChainID] = democConsumer

	democConsumerToReturn, ok := democConsumer.App.(T)
	if !ok {
		panic(fmt.Sprintf("democ consumer app type returned from app initer does not match app type passed in as type param: %T, %T",
			democConsumer.App, *new(T)))
	}
	return democConsumer, democConsumerToReturn
}

// AddConsumer adds a new consumer chain with "testchain<index+2>" as chainID to the coordinator
// and returns the test chain and app type. A new client is created on the provider to the new
// consumer chain (see CreateConsumerClient). The new consumer is initialized with the
// InitialValSet from the genesis state generated by the provider (see MakeConsumerGenesis).
//
// This method must be called after AddProvider.
func AddConsumer[Tp testutil.ProviderApp, Tc testutil.ConsumerApp](
	coordinator *ibctesting.Coordinator,
	s *suite.Suite,
	index int,
	appIniter ValSetAppIniter,
) *ConsumerBundle {
	// consumer chain ID
	chainID := ibctesting.GetChainID(index + 2)

	// create client to the consumer on the provider chain
	providerChain := coordinator.Chains[provChainID]
	providerApp := providerChain.App.(Tp)
	providerKeeper := providerApp.GetProviderKeeper()

	prop := providertypes.ConsumerAdditionProposal{
		Title:         fmt.Sprintf("start chain %s", chainID),
		Description:   "description",
		ChainId:       chainID,
		InitialHeight: clienttypes.Height{RevisionNumber: 0, RevisionHeight: 2},
		GenesisHash:   []byte("gen_hash"),
		BinaryHash:    []byte("bin_hash"),
		// NOTE: we cannot use the time.Now() because the coordinator chooses a hardcoded start time
		// using time.Now() could set the spawn time to be too far in the past or too far in the future
		SpawnTime:                         coordinator.CurrentTime,
		UnbondingPeriod:                   ccvtypes.DefaultConsumerUnbondingPeriod,
		CcvTimeoutPeriod:                  ccvtypes.DefaultCCVTimeoutPeriod,
		TransferTimeoutPeriod:             ccvtypes.DefaultTransferTimeoutPeriod,
		ConsumerRedistributionFraction:    ccvtypes.DefaultConsumerRedistributeFrac,
		BlocksPerDistributionTransmission: ccvtypes.DefaultBlocksPerDistributionTransmission,
		HistoricalEntries:                 ccvtypes.DefaultHistoricalEntries,
		DistributionTransmissionChannel:   "",
	}

	providerKeeper.SetPendingConsumerAdditionProp(providerChain.GetContext(), &prop)
	props := providerKeeper.GetAllPendingConsumerAdditionProps(providerChain.GetContext())
	s.Require().Len(props, 1, "unexpected len consumer addition proposals in AddConsumer")

	// commit the state on the provider chain
	coordinator.CommitBlock(providerChain)

	// get genesis state created by the provider
	consumerGenesisState, found := providerKeeper.GetConsumerGenesis(
		providerChain.GetContext(),
		chainID,
	)

	s.Require().True(found, "consumer genesis not found in AddConsumer")

	// use InitialValSet as the valset on the consumer
	var valz []*tmtypes.Validator
	for _, update := range consumerGenesisState.Provider.InitialValSet {
		// tmPubKey update.PubKey
		tmPubKey, err := tmencoding.PubKeyFromProto(update.PubKey)
		s.Require().NoError(err, "failed to convert tendermint pubkey")
		valz = append(valz, &tmtypes.Validator{
			PubKey:           tmPubKey,
			VotingPower:      update.Power,
			Address:          tmPubKey.Address(),
			ProposerPriority: 0,
		})
	}

	// create and instantiate consumer chain
	ibctesting.DefaultTestingAppInit = appIniter(consumerGenesisState.Provider.InitialValSet)
	testChain := ibctesting.NewTestChainWithValSet(s.T(), coordinator, chainID,
		tmtypes.NewValidatorSet(valz), providerChain.Signers)
	coordinator.Chains[chainID] = testChain

	consumerToReturn, ok := testChain.App.(Tc)
	if !ok {
		panic(fmt.Sprintf("consumer app type returned from app initer does not match app type passed in as type param: %T, %T",
			testChain.App, *new(Tc)))
	}

	return &ConsumerBundle{
		Chain: testChain,
		App:   consumerToReturn,
	}
}
