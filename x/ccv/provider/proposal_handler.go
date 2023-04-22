package provider

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	"github.com/cosmos/cosmos-sdk/x/gov/types/v1beta1"
	"github.com/cosmos/interchain-security/x/ccv/provider/keeper"
	"github.com/cosmos/interchain-security/x/ccv/provider/types"
)

// NewProviderProposalHandler defines the handler for consumer addition,
// consumer removal and equivocation proposals.
// Passed proposals are executed during EndBlock.
func NewProviderProposalHandler(k keeper.Keeper) v1beta1.Handler {
	return func(ctx sdk.Context, content v1beta1.Content) error {
		switch c := content.(type) {
		case *types.ConsumerAdditionProposal:
			return k.HandleConsumerAdditionProposal(ctx, c)
		case *types.ConsumerRemovalProposal:
			return k.HandleConsumerRemovalProposal(ctx, c)
		case *types.EquivocationProposal:
			return k.HandleEquivocationProposal(ctx, c)
		default:
			return sdkerrors.Wrapf(sdkerrors.ErrUnknownRequest, "unrecognized ccv proposal content type: %T", c)
		}
	}
}
