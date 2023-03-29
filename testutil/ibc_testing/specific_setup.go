package ibc_testing

// Contains example setup code for running e2e tests against a provider, consumer,
// and/or democracy consumer app.go implementation. This file is meant to be pattern matched
// for apps running e2e tests against their implementation.

import (
	"encoding/json"

	ibctesting "github.com/cosmos/interchain-security/legacy_ibc_testing/testing"

	"github.com/tendermint/tendermint/libs/log"
	tmdb "github.com/tendermint/tm-db"

	appConsumer "github.com/cosmos/interchain-security/app/consumer"
	appConsumerDemocracy "github.com/cosmos/interchain-security/app/consumer-democracy"
	appProvider "github.com/cosmos/interchain-security/app/provider"
)

// ProviderAppIniter implements ibctesting.AppIniter for a provider app
func ProviderAppIniter() (ibctesting.TestingApp, map[string]json.RawMessage) {
	encoding := appProvider.MakeTestEncodingConfig()
	testApp := appProvider.New(log.NewNopLogger(), tmdb.NewMemDB(), nil, true, map[int64]bool{},
		appProvider.DefaultNodeHome, 5, encoding, appProvider.EmptyAppOptions{})
	return testApp, appProvider.NewDefaultGenesisState(encoding.Codec)
}

// ConsumerAppIniter implements ibctesting.AppIniter for a consumer app
func ConsumerAppIniter() (ibctesting.TestingApp, map[string]json.RawMessage) {
	encoding := appConsumer.MakeTestEncodingConfig()
	testApp := appConsumer.New(log.NewNopLogger(), tmdb.NewMemDB(), nil, true, map[int64]bool{},
		appConsumer.DefaultNodeHome, 5, encoding, appConsumer.EmptyAppOptions{})
	return testApp, appConsumer.NewDefaultGenesisState(encoding.Codec)
}

// DemocracyConsumerAppIniter implements ibctesting.AppIniter for a democracy consumer app
func DemocracyConsumerAppIniter() (ibctesting.TestingApp, map[string]json.RawMessage) {
	encoding := appConsumerDemocracy.MakeTestEncodingConfig()
	testApp := appConsumerDemocracy.New(log.NewNopLogger(), tmdb.NewMemDB(), nil, true, map[int64]bool{},
		appConsumerDemocracy.DefaultNodeHome, 5, encoding, appConsumerDemocracy.EmptyAppOptions{})
	return testApp, appConsumerDemocracy.NewDefaultGenesisState(encoding.Codec)
}
