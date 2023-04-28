package app

import (
	"github.com/cosmos/cosmos-sdk/x/gov/types/v1beta1"
	"github.com/cosmos/cosmos-sdk/x/params/types/proposal"
	ibctransfertypes "github.com/cosmos/ibc-go/v7/modules/apps/transfer/types"
	ccvgov "github.com/cosmos/interchain-security/x/ccv/democracy/governance"
)

func IsProposalWhitelisted(content v1beta1.Content) bool {
	switch c := content.(type) {
	case *proposal.ParameterChangeProposal:
		return isLegacyParamChangeWhitelisted(c.Changes)

	default:
		return false
	}
}

func isLegacyParamChangeWhitelisted(paramChanges []proposal.ParamChange) bool {
	for _, paramChange := range paramChanges {
		_, found := LegacyWhitelistedParams[legacyParamChangeKey{Subspace: paramChange.Subspace, Key: paramChange.Key}]
		if !found {
			return false
		}
	}
	return true
}

func IsParamChangeWhitelisted(keys map[ccvgov.ParamChangeKey]struct{}) bool {
	for key := range keys {
		_, found := WhitelistedParams[ccvgov.ParamChangeKey{MsgType: key.MsgType, Key: key.Key}]
		if !found {
			return false
		}
	}
	return true
}

type legacyParamChangeKey struct {
	Subspace, Key string
}

var LegacyWhitelistedParams = map[legacyParamChangeKey]struct{}{
	// ibc transfer
	{Subspace: ibctransfertypes.ModuleName, Key: "SendEnabled"}:    {},
	{Subspace: ibctransfertypes.ModuleName, Key: "ReceiveEnabled"}: {},
	// add interchain account params(HostEnabled, AllowedMessages) once the module is added to the consumer app
}

var WhitelistedParams = map[ccvgov.ParamChangeKey]struct{}{
	// bank
	{MsgType: "/cosmos.bank.v1beta1.MsgUpdateParams", Key: "SendEnabled"}: {},
	// governance
	{MsgType: "/cosmos.gov.v1.MsgUpdateParams", Key: "depositparams"}: {}, // min_deposit, max_deposit_period
	{MsgType: "/cosmos.gov.v1.MsgUpdateParams", Key: "votingparams"}:  {}, // voting_period
	{MsgType: "/cosmos.gov.v1.MsgUpdateParams", Key: "tallyparams"}:   {}, // quorum,threshold,veto_threshold
	// staking
	{MsgType: "/cosmos.staking.v1beta1.MsgUpdateParams", Key: "UnbondingTime"}:     {},
	{MsgType: "/cosmos.staking.v1beta1.MsgUpdateParams", Key: "MaxValidators"}:     {},
	{MsgType: "/cosmos.staking.v1beta1.MsgUpdateParams", Key: "MaxEntries"}:        {},
	{MsgType: "/cosmos.staking.v1beta1.MsgUpdateParams", Key: "HistoricalEntries"}: {},
	{MsgType: "/cosmos.staking.v1beta1.MsgUpdateParams", Key: "BondDenom"}:         {},
	// distribution
	{MsgType: "/cosmos.distribution.v1beta1.MsgUpdateParams", Key: "communitytax"}: {},
	// {Subspace: distrtypes.ModuleName, Key: "baseproposerreward"}:  {},   depricated key
	// {Subspace: distrtypes.ModuleName, Key: "bonusproposerreward"}: {},   depricated key
	{MsgType: "/cosmos.distribution.v1beta1.MsgUpdateParams", Key: "withdrawaddrenabled"}: {},
	// mint
	{MsgType: "/cosmos.mint.v1beta1.MsgUpdateParams", Key: "MintDenom"}:           {},
	{MsgType: "/cosmos.mint.v1beta1.MsgUpdateParams", Key: "InflationRateChange"}: {},
	{MsgType: "/cosmos.mint.v1beta1.MsgUpdateParams", Key: "InflationMax"}:        {},
	{MsgType: "/cosmos.mint.v1beta1.MsgUpdateParams", Key: "InflationMin"}:        {},
	{MsgType: "/cosmos.mint.v1beta1.MsgUpdateParams", Key: "GoalBonded"}:          {},
	{MsgType: "/cosmos.mint.v1beta1.MsgUpdateParams", Key: "BlocksPerYear"}:       {},
	// add interchain account params(HostEnabled, AllowedMessages) once the module is added to the consumer app
}

var WhiteListModule = map[string]struct{}{
	"/cosmos.gov.v1.MsgUpdateParams":               {},
	"/cosmos.bank.v1beta1.MsgUpdateParams":         {},
	"/cosmos.staking.v1beta1.MsgUpdateParams":      {},
	"/cosmos.distribution.v1beta1.MsgUpdateParams": {},
	"/cosmos.mint.v1beta1.MsgUpdateParams":         {},
}

func IsModuleWhiteList(typeUrl string) bool {
	_, found := WhiteListModule[typeUrl]
	return found
}
