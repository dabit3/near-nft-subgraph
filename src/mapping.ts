import { near, JSONValue, json, ipfs, BigInt } from "@graphprotocol/graph-ts"
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
  const receipt = receiptWithOutcome.receipt;
  const outcome = receiptWithOutcome.outcome;
    
  const functionCall = action.toFunctionCall();

  const ipfsHash = 'bafybeiew2l6admor2lx6vnfdaevuuenzgeyrpfle56yrgse4u6nnkwrfeu'

  const methodName = functionCall.methodName

  log.info('Method name: {}', [methodName])

  if (methodName == 'buy' || methodName == 'nft_mint_one') {
    for (let logIndex = 0; logIndex < outcome.logs.length; logIndex++) {
      let outcomeLog = outcome.logs[logIndex].toString();
  
      log.info('outcomeLog {}', [outcomeLog])
  
      let parsed = outcomeLog.replace('EVENT_JSON:', '')
  
      let jsonData = json.try_fromString(parsed)
      const jsonObject = jsonData.value.toObject()
  
      let eventArray:JSONValue[]
      let eventData = jsonObject.get('data')
      if (eventData) {
        eventArray = eventData.toArray()
  
        let data = eventArray[0].toObject()
        const owner_id = data.get('owner_id')
        const tokenIds = data.get('token_ids')
    
        let entity = Token.load(receipt.signerId)
    
        if (!entity) {
          entity = new Token(receipt.signerId)
        }
    
        if (owner_id) {
          log.info('owner_id: {}', [owner_id.toString()])
          entity.owner = owner_id.toString()
        }
    
        if (tokenIds) {
          let ids:JSONValue[]
          ids = tokenIds.toArray()
          const tokenId = ids[0].toString()
          entity.tokenId = tokenId

          const image = ipfsHash + '/' + tokenId + '.png'
          entity.image = image
          let metadata = ipfsHash + '/' + tokenId + '.json'
          entity.metadata = metadata

          let metadataResult = ipfs.cat(metadata)
          if (metadataResult) {
            let value = json.fromBytes(metadataResult).toObject()
            if (value) {
              log.info('metadataResult: {}', [metadataResult.toString()])
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
        }
        entity.save()
      }
    }
  }
}
