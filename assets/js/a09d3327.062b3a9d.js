"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[270],{3696:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>r,contentTitle:()=>c,default:()=>d,frontMatter:()=>o,metadata:()=>a,toc:()=>l});var s=t(5893),i=t(1151);const o={sidebar_position:15,title:"Epochs"},c="ADR 014: Epochs",a={id:"adrs/adr-014-epochs",title:"Epochs",description:"Changelog",source:"@site/docs/adrs/adr-014-epochs.md",sourceDirName:"adrs",slug:"/adrs/adr-014-epochs",permalink:"/interchain-security/adrs/adr-014-epochs",draft:!1,unlisted:!1,tags:[],version:"current",sidebarPosition:15,frontMatter:{sidebar_position:15,title:"Epochs"},sidebar:"tutorialSidebar",previous:{title:"Slashing on the provider for consumer equivocation",permalink:"/interchain-security/adrs/adr-013-equivocation-slashing"},next:{title:"Partial Set Security",permalink:"/interchain-security/adrs/adr-015-partial-set-security"}},r={},l=[{value:"Changelog",id:"changelog",level:2},{value:"Status",id:"status",level:2},{value:"Context",id:"context",level:2},{value:"Decision",id:"decision",level:2},{value:"Consequences",id:"consequences",level:2},{value:"Positive",id:"positive",level:3},{value:"Negative",id:"negative",level:3},{value:"Neutral",id:"neutral",level:3},{value:"References",id:"references",level:2}];function h(e){const n={a:"a",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",ul:"ul",...(0,i.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.h1,{id:"adr-014-epochs",children:"ADR 014: Epochs"}),"\n",(0,s.jsx)(n.h2,{id:"changelog",children:"Changelog"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"2024-01-105: Proposed, first draft of ADR."}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"status",children:"Status"}),"\n",(0,s.jsx)(n.p,{children:"Proposed"}),"\n",(0,s.jsx)(n.h2,{id:"context",children:"Context"}),"\n",(0,s.jsxs)(n.p,{children:["In every block that the provider valset changes, a ",(0,s.jsx)(n.code,{children:"VSCPacket"})," must be sent to every consumer and a corresponding ",(0,s.jsx)(n.code,{children:"VSCMaturedPacket"})," sent back.\nGiven that the validator powers may change very often on the provider chain (e.g., the Cosmos Hub), this approach results in a large workload for the relayers.\nAlthough the validator powers may change very often, these changes are usually small and have an insignificant impact on the chain's security.\nIn other words, the valset on the consumers can be slightly outdated without affecting security.\nAs a matter of fact, this already happens due to relaying delays."]}),"\n",(0,s.jsxs)(n.p,{children:["As a solution, this ADR introduces the concept of ",(0,s.jsx)(n.em,{children:"epochs"}),".\nAn epoch consists of multiple blocks.\nThe provider sends ",(0,s.jsx)(n.code,{children:"VSCPacket"}),"s once per epoch.\nA ",(0,s.jsx)(n.code,{children:"VSCPacket"})," contains all the valset changes that occurred throughout the epoch."]}),"\n",(0,s.jsx)(n.h2,{id:"decision",children:"Decision"}),"\n",(0,s.jsx)(n.p,{children:"The implementation of epochs requires the following changes:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:["Add a param that sets the number of blocks in an epoch, i.e., ",(0,s.jsx)(n.code,{children:"BlocksPerEpoch"}),".\nWe can use ",(0,s.jsx)(n.code,{children:"BlockHeight() % BlocksPerEpoch == 0"})," to decide when an epoch is over.\nNote that ",(0,s.jsx)(n.code,{children:"BlocksPerEpoch"})," can also be a hardcoded constant as it's unlikely that it will change often."]}),"\n",(0,s.jsxs)(n.li,{children:["In every provider ",(0,s.jsx)(n.code,{children:"EndBlock()"}),", instead of queueing ",(0,s.jsx)(n.code,{children:"VSCPacket"})," data for every consumer chain, we accumulate the validator changes (similarly to how is done on the consumer, see ",(0,s.jsx)(n.code,{children:"AccumulateChanges"}),")."]}),"\n",(0,s.jsxs)(n.li,{children:["Modify the key assignment logic to allow for ",(0,s.jsx)(n.code,{children:"MustApplyKeyAssignmentToValUpdates"})," to be called once per epoch.\nCurrently, this method is called in every block before queueing a ",(0,s.jsx)(n.code,{children:"VSCPacket"}),".\nAlso, the method uses the ",(0,s.jsx)(n.code,{children:"KeyAssignmentReplacement"})," state, which is pruned at the end of every block.\nThis needs to be done once per epoch instead."]}),"\n",(0,s.jsxs)(n.li,{children:["At the end of every epoch, if there were validator set changes on the provider, then for every consumer chain, construct a ",(0,s.jsx)(n.code,{children:"VSCPacket"})," with all the accumulated validator changes and add it to the list of ",(0,s.jsx)(n.code,{children:"PendingVSCPackets"}),"."]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["As an optional change, to better accommodate ",(0,s.jsx)(n.a,{href:"https://informalsystems.notion.site/Partial-Set-Security-398ca9a1453740068be5c7964a4059bb",children:"the Partial Set Security design"}),", the validator changes should be accumulated per consumer chain.\nLike this, it would make it easier to have validators opting out from certain consumer chains."]}),"\n",(0,s.jsx)(n.h2,{id:"consequences",children:"Consequences"}),"\n",(0,s.jsx)(n.h3,{id:"positive",children:"Positive"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"Reduce the cost of relaying."}),"\n",(0,s.jsx)(n.li,{children:"Reduce the amount of IBC packets needed for ICS."}),"\n"]}),"\n",(0,s.jsx)(n.h3,{id:"negative",children:"Negative"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"Additional logic on the provider side as valset changes need to be accumulated."}),"\n",(0,s.jsx)(n.li,{children:"The changes might impact the key-assignment logic so special care is needed to avoid introducing bugs."}),"\n",(0,s.jsx)(n.li,{children:"Increase the delay in the propagation of validator set changes (but for reasonable epoch lengths on the order of ~hours or less, this is unlikely to be significant)."}),"\n"]}),"\n",(0,s.jsx)(n.h3,{id:"neutral",children:"Neutral"}),"\n",(0,s.jsx)(n.p,{children:"N/A"}),"\n",(0,s.jsx)(n.h2,{id:"references",children:"References"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"https://github.com/cosmos/interchain-security/issues/1087",children:"EPIC"})}),"\n"]})]})}function d(e={}){const{wrapper:n}={...(0,i.a)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(h,{...e})}):h(e)}},1151:(e,n,t)=>{t.d(n,{Z:()=>a,a:()=>c});var s=t(7294);const i={},o=s.createContext(i);function c(e){const n=s.useContext(o);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:c(e.components),s.createElement(o.Provider,{value:n},e.children)}}}]);