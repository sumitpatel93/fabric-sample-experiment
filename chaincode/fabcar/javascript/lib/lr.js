'use strict';

const {
    Contract
} = require('fabric-contract-api');
const shim = require('fabric-shim');
const ClientIdentity = require('fabric-shim').ClientIdentity;


class LandRegistration extends Contract {


    async init(stub) {
        return shim.success()
    }



    async invoke(stub, args) {
        let ret = stub.getFunctionAndParameters();
        console.info(ret);

        let method = this[ret.fcn];

        if (!method) {
            console.error('no function of name:' + ret.fcn + ' found');
            throw new Error('Received unknown function ' + ret.fcn + ' invocation');
        }
        try {
            let payload = await method(stub, ret.params);
            return shim.success(payload);
        } catch (err) {
            console.info(err);
            return shim.error(err);
        }
    }




    async createLandRecord(ctx, args) {
        if (args.length != 4) {
            throw new Error('Incorrect number of arguments,Expected number of arguments is 4');
        }

        let cid = new ClientIdentity(ctx.stub);
        if (cid.assertAttributeValue('userType', 'BOR')) {

            let _landId = args[0];
            let _ownerId = args[1];
            let _ownerName = args[2];
            let _landStatus = 'NEW';
            let _saleDeedId = args[3];


            let land = await stub.getState(_landId);
            if (land.toString()) {
                throw new Error('This marble already exists' + _landId);
            }

            let landDetail = {};
            landDetail.landId = _landId;
            landDetail.ownerId = _ownerId;
            landDetail.ownerName = _ownerName;
            landDetail.landStatus = _landStatus;
            landDetail.saleDeed = _saleDeedId;


            await ctx.stub.putState(_landId, Buffer.from(JSON.stringify(landDetail)));
            console.info(JSON.stringify(landDetail));
            console.log("Land Id created successfully");
            return shim.success();

        } else {
            throw new Error('Not a valid user');
        }
    }



    async createSaleDeed(ctx, args) {
        //check for the correct number of arguments, else throw err
        if (args.length != 6) {
            throw new Error('Incorrenct number of arguments,Expected number of arguments is 6');
        }


        let cid = new ClientIdentity(ctx.stub);
        //check for the correct role
        if (cid.assertAttributeValue('userType', 'DOSR')) {
            let _docType = args[0];
            let _saleDeedId = args[1];
            let _landId = args[2];
            let _sellerId = args[3];
            let _buyerId = args[4];
            let _buyerName = args[5]


            //create sale deed object and assign values
            const saleDeed = {}
            saleDeed.docType = _docType,
                saleDeed.saleDeedId = _saleDeedId,
                saleDeed.landId = _landId,
                saleDeed.sellerId = _sellerId,
                saleDeed.buyerId = _buyerId,
                saleDeed.buyerName = _buyerName

            //check if the saledeedid already exists 
            let saleDeedAsBytes = await stub.getState(_saleDeedId);
            if (!saleDeedAsBytes.toString()) {
                console.log("sale deed does not exist")
            } else if (saleDeedAsBytes !== null) {
                let result = JSON.parse(saleDeedAsBytes);
                console.log('sale deed already exsts' + result);
                return JSON.stringify(result);
            } else {
                //check for landId status
                let landAsBytes = await stub.getState(_landId)
                if (!landAsBytes.toString()) {
                    let jsonresp = {};
                    jsonresp.Error = 'Land Id doesnt exist';
                    throw new Error(JSON.stringify(jsonresp));
                } else if (landAsBytes == null) {
                    let result = JSON.parse(landAsBytes)
                    console.log('Land results are empty');
                } else {
                    let landDetail = {};
                    let landRecordStatus = landDetail.landStatus;

                    if (landRecordStatus == "NEW" || landRecordStatus == "OPEN" || landRecordStatus == "MUTATION_DONE") {
                        landDetail.landStatus = "REGISTRATION_DONE";
                        landDetail.saleDeedId = _saleDeedId
                        await ctx.stub.putState(saleDeedId, Buffer.from(JSON.stringify(saleDeed)));
                        console.log('sale deed successfully created');
                        console.info(JSON.stringify(saleDeed));
                        return shim.success();
                    }
                }
            }
        } else {
            throw new Error('Not a valid user');
        }
    }


    async getSaleDeed(ctx, args) {
        if (args.length != 1) {
            throw new Error('Incorrenct number of arguments,Expected number of arguments is 1');
        }

        let cid = new ClientIdentity(ctx.stub);
        if (cid.assertAttributeValue('userType', 'DOSR')) {
            let saleDeedId = args[0];
            console.log('query made for ' + saleDeedId);

            let returnAsBytes = await ctx.stub.getState(saleDeedId);
            console.log(returnAsBytes);
            if (!returnAsBytes) {
                return new Error(`${saleDeedId} does not exist`);
            } else {
                let result = JSON.parse(returnAsBytes);
                console.log(result);
                return JSON.stringify(result);
            }

        } else {
            throw new Error('Not a valid user');
        }
    }


    async getLandRecord(ctx, args) {
        if (args.length != 1) {
            throw new Error('Incorrenct number of arguments,Expected number of arguments is 1');
        }
        let cid = new ClientIdentity(ctx.stub);
        if (cid.assertAttributeValue('userType', 'BOR')) {
            let landId = args[0];
            console.log('query made for ' + landId);

            let landDetailAsBytes = await ctx.stub.getState(landId);
            console.log(landDetailAsBytes);

            if (!landDetailAsBytes) {
                return new Error(`${landId} does not exist`);
            } else {
                let landIdResult = JSON.parse(landDetailAsBytes);
                console.log(landIdResult);
                return JSON.stringify(landIdResult);
            }
        } else {
            throw new Error('Not a valid user');
        }




    }

    async getBuyerFromSaleDeed(ctx, args) {

        if (args.length != 1) {
            throw new Error('Incorrenct number of arguments,Expected number of arguments is 1');
        }
        let cid = new ClientIdentity(ctx.stub);
        if (cid.assertAttributeValue('userType', 'BOR')) {
            let saleDeedId = args[0];
            console.log('query made for ' + saleDeedId)
            let saleDeedAsBytes = await ctx.stub.getState(saleDeedId)
            console.log(saleDeedAsBytes);

            if (!saleDeedAsBytes) {
                return new Error(`${saleDeedId} does not exist`);
            } else {
                let saleDeedResult = JSON.parse(saleDeed);
                console.log(saleDeedResult.buyerName);
                return JSON.stringify(saleDeedResult.buyerName);
            }
        } else {
            throw new Error('Not a valid user');
        }
    }




    async getLandRecordStatus(ctx, args) {
        if (args.length != 1) {
            throw new Error('Incorrenct number of arguments,Expected number of arguments is 1');
        }
        let cid = new ClientIdentity(ctx.stub);
        if (cid.assertAttributeValue('userType', 'BOR')) {

            let landId = args[0];
            console.log('query made for the ' + landId);

            let landDetailBytes = await ctx.stub.getState(landId);
            console.log(landDetailBytes);
            if (!landDetailBytes) {
                return new Error(`${landId} doesnot exist`);
            } else {
                let landIdResult = JSON.parse(landDetail);
                console.log(landIdResult.landStatus);
                return JSON.stringify(landDetail.landStatus);

            }
        } else {
            throw new Error('Not a valid user');
        }
    }




    //INCOMPLETE
    async mutateLandRecord(ctx, args) {
        if (args.length != 3) {
            throw new Error('Incorrect number of arguments , expected number of arguments is 2');
        }
        let cid = new ClientIdentity(ctx.stub);
        if (cid.assertAttributeValue('userType', 'BOR')) {
            let landId = args[0];
            let newOwnerName = args[1];
            let newOwnerId = args[2];
            console.info('- start mutation ', landId, newOwnerName,newOwnerId);


            let landresults = await ctx.stub.getState(landId);
            if (!landresults) {
                return new Error(`${landId} Failed to get land record`);
            } else if (landresults === null) {
                return shim.Error('Land record does not exist')
            } else {
                let landToTransfer = {}
                try {
                    let landRecordStatus = landresults.landRecordStatus;    
                    if (landRecordStatus == "REGISTRATION_DONE")
                    {
                        landToTransfer.ownerId = newOwnerId;
                        landToTransfer.ownerName = newOwnerName;
                        landToTransfer.landStatus = "MUTATION_DONE"
                    }
                    await ctx.stub.putState(landId, Buffer.from(JSON.stringify(landToTransfer)));
                    console.info('Success, mutation done');
                } catch (err) {
                    let jsonresp = {};
                    jsonresp.error = "Failed to decode json of";
                    throw new Error(jsonresp);
                }            
            }           

        } else {
            throw new Error('Not a valid user');
        }





    }

    async getLandRecordLifeCycle(ctx, args) {
        if (args.length < 1) {
            throw new Error('Incorrect number of arguments.Expecting 1');
        }
        let cid = new ClientIdentity(ctx.stub);
        if (cid.assertAttributeValue('userType', 'DOSR')) {
            let landId = args[0];
            console.log('gettingland record life cycle for', landId);

            let resultsIterator = await ctx.stub.getHistoryForKey(landId);
            console.log(resultsIterator);
            return JSON.stringify(getHistoryForKey);
        } else {
            throw new Error('Not a valid user');
        }
    }
}
shim.start(new LandRegistration())
