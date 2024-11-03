class APIfeatures{
    constructor(query,queryFields){
        this.query = query;
        this.queryFields = queryFields;
    }

    filter(){
        const queryObj = {...this.queryFields};
        const excludedFields = ['page','sort','limit','fields'];
        excludedFields.forEach(el => delete queryObj[el]); 
        
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g,match => `$${match}`);
        // console.log(JSON.parse(queryStr));

        // let query = Tour.find(JSON.parse(queryStr));
        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }

    sort(){
        if(this.queryFields.sort){
            const sortby = this.queryFields.sort.split(',').join(' ');
            console.log(sortby);

            this.query = this.query.sort(sortby);
        }else{
            this.query = this.query.sort('createAt');
        }

        return this;
    }

    Limitfields() {
        if(this.queryFields.fields){
            const fields = this.queryFields.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }else{
            this.query = this.query.select('-__v');
        }

        return this;
    }
    Pagination(){
        const page = Number(this.queryFields.page) * 1 || 1;
        const limit = Number(this.queryFields.limit) * 1 || 100;
        const skip = (page - 1) * limit;
    
        // console.log(`Page: ${page}, Limit: ${limit}, Skip: ${skip}`);
        this.query = this.query.skip(skip).limit(limit);
    
        return this;
    }

}

module.exports = APIfeatures;