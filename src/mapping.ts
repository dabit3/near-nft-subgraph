import { near, JSONValue, json, ipfs } from "@graphprotocol/graph-ts"
import { Token } from "../generated/schema"
import { log } from '@graphprotocol/graph-ts'

export function handleReceipt(
  receipt: near.ReceiptWithOutcome
): void {
  const actions = receipt.receipt.actions;
  for (let i = 0; i < actions.length; i++) {
    handleAction(actions[i], receipt);
  }
}

function handleAction(
  action: near.ActionValue,
  receiptWithOutcome: near.ReceiptWithOutcome
): void {
  if (action.kind != near.ActionKind.FUNCTION_CALL) {
    return;
  }
  const outcome = receiptWithOutcome.outcome;
  const functionCall = action.toFunctionCall();
  const ipfsHash = 'bafybeiew2l6admor2lx6vnfdaevuuenzgeyrpfle56yrgse4u6nnkwrfeu'
  const methodName = functionCall.methodName

  if (methodName == 'buy' || methodName == 'nft_mint_one') {
    for (let logIndex = 0; logIndex < outcome.logs.length; logIndex++) {
      let outcomeLog = outcome.logs[logIndex].toString();
  
      log.info('outcomeLog {}', [outcomeLog])
  
      let parsed = outcomeLog.replace('EVENT_JSON:', '')
  
      let jsonData = json.try_fromString(parsed)
      const jsonObject = jsonData.value.toObject()
  
      let eventData = jsonObject.get('data')
      if (eventData) {
        let eventArray:JSONValue[] = eventData.toArray()
  
        let data = eventArray[0].toObject()
        const tokenIds = data.get('token_ids')
        const owner_id = data.get('owner_id')
        if (!tokenIds) return

        let ids:JSONValue[] = tokenIds.toArray()
        const tokenId = ids[0].toString()

        let entity = Token.load(tokenId)

        if (!entity) {
          entity = new Token(tokenId)
          entity.tokenId = tokenId
        }
    
        if (owner_id) {
          entity.owner = owner_id.toString()
        }
    
        entity.image = ipfsHash + '/' + tokenId + '.png'
        let metadata = ipfsHash + '/' + tokenId + '.json'
        entity.metadata = metadata

        let metadataResult = ipfs.cat(metadata)
        if (metadataResult) {
          let value = json.fromBytes(metadataResult).toObject()
          if (value) {
            const kind = value.get('kind')
            if (kind) {
              entity.kind = kind.toString()
            }
            const seed = value.get('seed')
            if (seed) {
              entity.seed = seed.toI64() as i32
            }
          }
        }
        entity.save()
      }
    }
  }
}
