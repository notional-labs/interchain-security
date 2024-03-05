"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[344],{6064:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>i,contentTitle:()=>d,default:()=>u,frontMatter:()=>a,metadata:()=>o,toc:()=>l});var s=t(5893),r=t(1151);const a={sidebar_position:3,title:"Key Assignment"},d="ADR 001: Key Assignment",o={id:"adrs/adr-001-key-assignment",title:"Key Assignment",description:"Changelog",source:"@site/docs/adrs/adr-001-key-assignment.md",sourceDirName:"adrs",slug:"/adrs/adr-001-key-assignment",permalink:"/interchain-security/adrs/adr-001-key-assignment",draft:!1,unlisted:!1,tags:[],version:"current",sidebarPosition:3,frontMatter:{sidebar_position:3,title:"Key Assignment"},sidebar:"tutorialSidebar",previous:{title:"ADR Template",permalink:"/interchain-security/adrs/adr-template"},next:{title:"Jail Throttling",permalink:"/interchain-security/adrs/adr-002-throttle"}},i={},l=[{value:"Changelog",id:"changelog",level:2},{value:"Status",id:"status",level:2},{value:"Context",id:"context",level:2},{value:"Decision",id:"decision",level:2},{value:"State required",id:"state-required",level:3},{value:"Protocol overview",id:"protocol-overview",level:3},{value:"Consequences",id:"consequences",level:2},{value:"Positive",id:"positive",level:3},{value:"Negative",id:"negative",level:3},{value:"Neutral",id:"neutral",level:3},{value:"References",id:"references",level:2}];function c(e){const n={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",ul:"ul",...(0,r.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.h1,{id:"adr-001-key-assignment",children:"ADR 001: Key Assignment"}),"\n",(0,s.jsx)(n.h2,{id:"changelog",children:"Changelog"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"2022-12-01: Initial Draft"}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"status",children:"Status"}),"\n",(0,s.jsx)(n.p,{children:"Accepted"}),"\n",(0,s.jsx)(n.h2,{id:"context",children:"Context"}),"\n",(0,s.jsx)(n.p,{children:"KeyAssignment is the name of the feature that allows validator operators to use different consensus keys for each consumer chain validator node that they operate."}),"\n",(0,s.jsx)(n.h2,{id:"decision",children:"Decision"}),"\n",(0,s.jsxs)(n.p,{children:["It is possible to change the keys at any time by submitting a transaction (i.e., ",(0,s.jsx)(n.code,{children:"MsgAssignConsumerKey"}),")."]}),"\n",(0,s.jsx)(n.h3,{id:"state-required",children:"State required"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"ValidatorConsumerPubKey"})," - Stores the validator assigned keys for every consumer chain."]}),"\n"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-golang",children:"ConsumerValidatorsBytePrefix | len(chainID) | chainID | providerConsAddress -> consumerKey\n"})}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"ValidatorByConsumerAddr"})," - Stores the mapping from validator addresses on consumer chains to validator addresses on the provider chain. Needed for the consumer initiated slashing sub-protocol."]}),"\n"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-golang",children:"ValidatorsByConsumerAddrBytePrefix | len(chainID) | chainID | consumerConsAddress -> providerConsAddress\n"})}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"KeyAssignmentReplacements"})," - Stores the key assignments that need to be replaced in the current block. Needed to apply the key assignments received in a block to the validator updates sent to the consumer chains."]}),"\n"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-golang",children:"KeyAssignmentReplacementsBytePrefix | len(chainID) | chainID | providerConsAddress -> abci.ValidatorUpdate{PubKey: oldConsumerKey, Power: currentPower},\n"})}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"ConsumerAddrsToPrune"})," - Stores the mapping from VSC ids to consumer validators addresses. Needed for pruning ",(0,s.jsx)(n.code,{children:"ValidatorByConsumerAddr"}),"."]}),"\n"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-golang",children:"ConsumerAddrsToPruneBytePrefix | len(chainID) | chainID | vscID -> []consumerConsAddresses\n"})}),"\n",(0,s.jsx)(n.h3,{id:"protocol-overview",children:"Protocol overview"}),"\n",(0,s.jsxs)(n.p,{children:["On receiving a ",(0,s.jsx)(n.code,{children:"MsgAssignConsumerKey(chainID, providerAddr, consumerKey)"})," message:"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-golang",children:"// get validator from staking module  \nvalidator, found := stakingKeeper.GetValidator(providerAddr)\nif !found {\n    return ErrNoValidatorFound\n}\nproviderConsAddr := validator.GetConsAddr()\n\n// make sure consumer key is not in use\nconsumerAddr := utils.TMCryptoPublicKeyToConsAddr(consumerKey)\nif _, found := GetValidatorByConsumerAddr(ChainID, consumerAddr); found {\n    return ErrInvalidConsumerConsensusPubKey\n}\n\n// check whether the consumer chain is already registered\n// i.e., a client to the consumer was already created\nif _, consumerRegistered := GetConsumerClientId(chainID); consumerRegistered {\n    // get the previous key assigned for this validator on this consumer chain\n    oldConsumerKey, found := GetValidatorConsumerPubKey(chainID, providerConsAddr)\n    if found {\n        // mark this old consumer key as prunable once the VSCMaturedPacket\n        // for the current VSC ID is received\n        oldConsumerAddr := utils.TMCryptoPublicKeyToConsAddr(oldConsumerKey)\n        vscID := GetValidatorSetUpdateId()\n        AppendConsumerAddrsToPrune(chainID, vscID, oldConsumerAddr)\n    } else {\n        // the validator had no key assigned on this consumer chain\n        oldConsumerKey := validator.TmConsPublicKey()\n    }\n\n    // check whether the validator is valid, i.e., its power is positive\n    if currentPower := stakingKeeper.GetLastValidatorPower(providerAddr); currentPower > 0 {\n        // to enable multiple calls of AssignConsumerKey in the same block by the same validator\n        // the key assignment replacement should not be overwritten\n        if _, found := GetKeyAssignmentReplacement(chainID, providerConsAddr); !found {\n            // store old key and power for modifying the valset update in EndBlock\n            oldKeyAssignment := abci.ValidatorUpdate{PubKey: oldConsumerKey, Power: currentPower}\n            SetKeyAssignmentReplacement(chainID, providerConsAddr, oldKeyAssignment)\n        }\n    }\n} else {\n    // if the consumer chain is not registered, then remove the previous reverse mapping\n    if oldConsumerKey, found := GetValidatorConsumerPubKey(chainID, providerConsAddr); found {\n        oldConsumerAddr := utils.TMCryptoPublicKeyToConsAddr(oldConsumerKey)\n        DeleteValidatorByConsumerAddr(chainID, oldConsumerAddr)\n    }\n}\n\n\n// set the mapping from this validator's provider address to the new consumer key\nSetValidatorConsumerPubKey(chainID, providerConsAddr, consumerKey)\n\n// set the reverse mapping: from this validator's new consensus address \n// on the consumer to its consensus address on the provider\nSetValidatorByConsumerAddr(chainID, consumerAddr, providerConsAddr)\n"})}),"\n",(0,s.jsxs)(n.p,{children:["When a new consumer chain is registered, i.e., a client to the consumer chain is created, the provider constructs the consumer CCV module part of the genesis state (see ",(0,s.jsx)(n.code,{children:"MakeConsumerGenesis"}),")."]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-golang",children:"func (k Keeper) MakeConsumerGenesis(chainID string) (gen consumertypes.GenesisState, nextValidatorsHash []byte, err error) {\n    // ...\n    // get initial valset from the staking module\n    var updates []abci.ValidatorUpdate{}\n    stakingKeeper.IterateLastValidatorPowers(func(providerAddr sdk.ValAddress, power int64) (stop bool) {\n        validator := stakingKeeper.GetValidator(providerAddr)\n        providerKey := validator.TmConsPublicKey()\n\t\tupdates = append(updates, abci.ValidatorUpdate{PubKey: providerKey, Power: power})\n\t\treturn false\n\t})\n\n    // applies the key assignment to the initial validator\n\tfor i, update := range updates {\n\t\tproviderAddr := utils.TMCryptoPublicKeyToConsAddr(update.PubKey)\n\t\tif consumerKey, found := GetValidatorConsumerPubKey(chainID, providerAddr); found {\n\t\t\tupdates[i].PubKey = consumerKey\n\t\t}\n\t}\n    gen.InitialValSet = updates\n\n    // get a hash of the consumer validator set from the update\n\tupdatesAsValSet := tendermint.PB2TM.ValidatorUpdates(updates)\n\thash := tendermint.NewValidatorSet(updatesAsValSet).Hash()\n\n\treturn gen, hash, nil\n}\n"})}),"\n",(0,s.jsxs)(n.p,{children:["On ",(0,s.jsx)(n.code,{children:"EndBlock"})," while queueing ",(0,s.jsx)(n.code,{children:"VSCPacket"}),"s to send to registered consumer chains:"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-golang",children:"func QueueVSCPackets() {\n\tvalUpdateID := GetValidatorSetUpdateId()\n\t// get the validator updates from the staking module\n\tvalUpdates := stakingKeeper.GetValidatorUpdates()\n\n\tIterateConsumerChains(func(chainID, clientID string) (stop bool) {\n\t\t// apply the key assignment to the validator updates\n\t\tvalUpdates := ApplyKeyAssignmentToValUpdates(chainID, valUpdates)\n        // ..\n    })\n    // ...\n}\n\nfunc ApplyKeyAssignmentToValUpdates(\n    chainID string, \n    valUpdates []abci.ValidatorUpdate,\n) (newUpdates []abci.ValidatorUpdate) {\n    for _, valUpdate := range valUpdates {\n        providerAddr := utils.TMCryptoPublicKeyToConsAddr(valUpdate.PubKey)\n\n        // if a key assignment replacement is found, then\n        // remove the valupdate with the old consumer key\n        // and create two new valupdates\n        prevConsumerKey, _, found := GetKeyAssignmentReplacement(chainID, providerAddr)\n        if found {\n            // set the old consumer key's power to 0\n            newUpdates = append(newUpdates, abci.ValidatorUpdate{\n\t\t\t\tPubKey: prevConsumerKey,\n\t\t\t\tPower:  0,\n\t\t\t})\n\t\t    // set the new consumer key's power to the power in the update\n            newConsumerKey := GetValidatorConsumerPubKey(chainID, providerAddr)\n\t\t\tnewUpdates = append(newUpdates, abci.ValidatorUpdate{\n\t\t\t\tPubKey: newConsumerKey,\n\t\t\t\tPower:  valUpdate.Power,\n\t\t\t})\n            // delete key assignment replacement\n\t\t\tDeleteKeyAssignmentReplacement(chainID, providerAddr)\n        } else {\n            // there is no key assignment replacement;\n            // check if the validator's key is assigned\n            consumerKey, found := k.GetValidatorConsumerPubKey(ctx, chainID, providerAddr)\n\t\t\tif found {\n                // replace the update containing the provider key \n                // with an update containing the consumer key\n\t\t\t\tnewUpdates = append(newUpdates, abci.ValidatorUpdate{\n\t\t\t\t\tPubKey: consumerKey,\n\t\t\t\t\tPower:  valUpdate.Power,\n\t\t\t\t})\n\t\t\t} else {\n\t\t\t\t// keep the same update\n\t\t\t\tnewUpdates = append(newUpdates, valUpdate)\n\t\t\t}\n        }\n    }\n\n    // iterate over the remaining key assignment replacements\n    IterateKeyAssignmentReplacements(chainID, func(\n\t\tpAddr sdk.ConsAddress,\n\t\tprevCKey tmprotocrypto.PublicKey,\n\t\tpower int64,\n\t) (stop bool) {\n       // set the old consumer key's power to 0\n\t\tnewUpdates = append(newUpdates, abci.ValidatorUpdate{\n\t\t\tPubKey: prevCKey,\n\t\t\tPower:  0,\n\t\t})\n        // set the new consumer key's power to the power in key assignment replacement\n\t\tnewConsumerKey := GetValidatorConsumerPubKey(chainID, pAddr)\n\t\tnewUpdates = append(newUpdates, abci.ValidatorUpdate{\n\t\t\tPubKey: newConsumerKey,\n\t\t\tPower:  power,\n\t\t})\n\t\treturn false\n\t})\n\n    // remove all the key assignment replacements\n   \n    return newUpdates\n}\n"})}),"\n",(0,s.jsxs)(n.p,{children:["On receiving a ",(0,s.jsx)(n.code,{children:"SlashPacket"})," from a consumer chain with id ",(0,s.jsx)(n.code,{children:"chainID"})," for a infraction of a validator ",(0,s.jsx)(n.code,{children:"data.Validator"}),":"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-golang",children:"func HandleSlashPacket(chainID string, data ccv.SlashPacketData) (success bool, err error) {\n    // ...\n    // the slash packet validator address may be known only on the consumer chain;\n\t// in this case, it must be mapped back to the consensus address on the provider chain\n    consumerAddr := sdk.ConsAddress(data.Validator.Address)\n    providerAddr, found := GetValidatorByConsumerAddr(chainID, consumerAddr)\n    if !found {\n        // the validator has the same key on the consumer as on the provider\n        providerAddr = consumerAddr\n    }\n    // ...\n}\n"})}),"\n",(0,s.jsxs)(n.p,{children:["On receiving a ",(0,s.jsx)(n.code,{children:"VSCMatured"}),":"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-golang",children:"func OnRecvVSCMaturedPacket(packet channeltypes.Packet, data ccv.VSCMaturedPacketData) exported.Acknowledgement {\n    // ...\n    // prune previous consumer validator address that are no longer needed\n    consumerAddrs := GetConsumerAddrsToPrune(chainID, data.ValsetUpdateId)\n\tfor _, addr := range consumerAddrs {\n\t\tDeleteValidatorByConsumerAddr(chainID, addr)\n\t}\n\tDeleteConsumerAddrsToPrune(chainID, data.ValsetUpdateId)\n    // ...\n}\n"})}),"\n",(0,s.jsx)(n.p,{children:"On stopping a consumer chain:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-golang",children:"func (k Keeper) StopConsumerChain(ctx sdk.Context, chainID string, closeChan bool) (err error) {\n    // ...\n    // deletes all the state needed for key assignments on this consumer chain\n    // ...\n}\n"})}),"\n",(0,s.jsx)(n.h2,{id:"consequences",children:"Consequences"}),"\n",(0,s.jsx)(n.h3,{id:"positive",children:"Positive"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"Validators can use different consensus keys on the consumer chains."}),"\n"]}),"\n",(0,s.jsx)(n.h3,{id:"negative",children:"Negative"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"None"}),"\n"]}),"\n",(0,s.jsx)(n.h3,{id:"neutral",children:"Neutral"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:["The consensus state necessary to create a client to the consumer chain must use the hash returned by the ",(0,s.jsx)(n.code,{children:"MakeConsumerGenesis"})," method as the ",(0,s.jsx)(n.code,{children:"nextValsHash"}),"."]}),"\n",(0,s.jsxs)(n.li,{children:["The consumer chain can no longer check the initial validator set against the consensus state on ",(0,s.jsx)(n.code,{children:"InitGenesis"}),"."]}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"references",children:"References"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"https://github.com/cosmos/interchain-security/issues/26",children:"Key assignment issue"})}),"\n"]})]})}function u(e={}){const{wrapper:n}={...(0,r.a)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(c,{...e})}):c(e)}},1151:(e,n,t)=>{t.d(n,{Z:()=>o,a:()=>d});var s=t(7294);const r={},a=s.createContext(r);function d(e){const n=s.useContext(a);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:d(e.components),s.createElement(a.Provider,{value:n},e.children)}}}]);