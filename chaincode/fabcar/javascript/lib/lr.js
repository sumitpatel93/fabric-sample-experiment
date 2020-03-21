'use strict';

const {
    Contract
} = require('fabric-contract-api');
const shim = require('fabric-shim');
const ClientIdentity = require('fabric-shim').ClientIdentity;


class LandRegistration extends Contract {


    async init(ctx) {
        return shim.success()
    }

    async invoke() {

    }

    async createLandRecord(ctx, args ) {
        if ( args.length != 4) {
            throw new Error('Incorrect number of arguments,Expected number of arguments is 4');
        }
        let landId = args[0];
        let ownerId = args[1];
        let  ownerName = args[2];
        let  landStatus = 'NEW';
        let saleDeed = args[3]

        const landDetail = {
            landId: landId,
            ownerId: ownerId,
            ownerName: ownerName,
            landStatus: landStatus,
            saleDeed: saleDeed
        }
        let land = await stub.getState(landId);
        if ( land.toString()){
            throw new Error('This marble already exists' + landId);
        }

        let landDetail = {};
        landDetail.landId = landId;
        landDetail.ownerId = ownerId;
        landDetail.ownerName = ownerName;
        landDetail.landStatus = landStatus;
        landDetail.saleDeed = saleDeed;


        await ctx.stub.putState(landId, Buffer.from(JSON.stringify(landDetail)));
        console.info(JSON.stringify(landDetail));
        console.log("Land Id created successfully");
        return shim.success();
    }


    //INCOMPLETE
    async createSaleDeed(ctx, args) {
        if ( args.length != 6) {
            throw new Error('Incorrenct number of arguments,Expected number of arguments is 6');
        }
        let docType = args[0];
        let saleDeedId = args[1];
        let landId = args[2];
        let sellerId = args[3];
        let buyerId = args[4];
        let buyerName = args[5]


        let saleDeed = await stub.getState(saleDeedId);
        if (saleDeedId.toString()){
            throw new Error('This saledeed already exists ' + saleDeedId);
        }

            const saleDeed = {}
            saleDeed.docType = docType,
            saleDeed.saleDeedId = saleDeedId,
            saleDeed.landId = landId,
            saleDeed.sellerId = sellerId,
            saleDeed.buyerId = buyerId,
            saleDeed.buyerName = buyerName
        

        let saleDeedAsBytes = await stub.getState(saleDeedId);
        if(!saleDeedAsBytes.toString()){
            console.log("sale deed does not exist")
        } else {
           let result = JSON.parse(saleDeedAsBytes);
           console.log(result);
           return JSON.stringify(result);
        }
        
        let landDetail = {};
        let landRecordStatus = landDetail.landStatus;

        if (landRecordStatus == "NEW" || landRecordStatus == "OPEN" || landRecordStatus == "MUTATION_DONE") {
            await ctx.stub.putState(saleDeedId, Buffer.from(JSON.stringify(saleDeed)));
            console.log('sale deed successfully created');
            console.info(JSON.stringify(saleDeed));
            return shim.success();
        }      
    }


    async getSaleDeed(ctx, args) {     

        if ( args.length != 1) {
            throw new Error('Incorrenct number of arguments,Expected number of arguments is 1');
        }
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
    }


    async getLandRecord(ctx, args) {
        if ( args.length != 1) {
            throw new Error('Incorrenct number of arguments,Expected number of arguments is 1');
        }
        let landId = args[0];
        console.log('query made for ' + landId);

        let landDetailAsBytes = await ctx.stub.getState(landId);
        console.log(landDetailAsBytes);

        if (!landDetailAsBytes ) {
            return new Error(`${landId} does not exist`);
        } else {
            let landIdResult = JSON.parse(landDetailAsBytes);
            console.log(landIdResult);
            return JSON.stringify(landIdResult);
        }
    }

    async getBuyerFromSaleDeed(ctx, args) {
        if ( args.length != 1) {
            throw new Error('Incorrenct number of arguments,Expected number of arguments is 1');
        }
        let saleDeedId = args[0];
        console.log('query made for ' + saleDeedId)


        let saleDeedAsBytes = await ctx.stub.getState(saleDeedId)
        console.log(saleDeedAsBytes);

        if (!saleDeedAsBytes) {
            return new Error(`${saleDeedId} does not exist`);
        } else {
            let saleDeedResult = JSON.parse(saleDeed);
            console.log(saleDeedResult);
            return JSON.stringify(saleDeedResult);
        }


    }

    async getLandRecordStatus(ctx, args) {
        if ( args.length != 1) {
            throw new Error('Incorrenct number of arguments,Expected number of arguments is 1');
        }
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
    }
    
    //INCOMPLETE
    // async mutateLandRecord(ctx, args) {
    //     if ( args.length != 2) {
    //         throw new Error('Incorrect number of arguments , expected number of arguments is 2');
    //     }

    //     let landId = args[0];
    //     let newOwnerName = args[1];


    //     let landresults = await ctx.stub.getState(landId);
    //     console.log(landresults);

    //     if(!landresults ){
    //         return new Error (`${landId} Failed to get land record`);
    //     } else if ( landresults === null ){
    //         return  shim.Error('Land record does not exist')

    //     }

    //     landToTransfer = {};
    //     landRecordStatus = landToTransfer.landRecordStatus
    //     saleDeedId = landToTransfer.saleDeedId

    // }

    async getLandRecordLifeCycle(ctx, args) {
        if (args.length < 1 ){
            throw new Error('Incorrect number of arguments.Expecting 1');
        }

        let landId = args[0];
        console.log('gettingland record life cycle for',landId);

        let resultsIterator = await ctx.stub.getHistoryForKey(landId);
        console.log(resultsIterator);
        return JSON.stringify(getHistoryForKey);
    }
}
shim.start(new LandRegistration())