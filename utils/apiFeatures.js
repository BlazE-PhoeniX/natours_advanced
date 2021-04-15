class APIFeatures {
  constructor(query, queryObj) {
    this.query = query;
    this.queryObj = queryObj;
  }

  filter() {
    // extracting the query
    let filterObj = { ...this.queryObj };
    ["limit", "page", "sort", "fields"].forEach(el => delete filterObj[el]);

    // filtering
    let queryStr = JSON.stringify(filterObj);
    queryStr = queryStr.replaceAll(
      /\b(gt|gte|lt|lte)\b/g,
      match => `$${match}`
    );
    filterObj = JSON.parse(queryStr);

    this.query = this.query.find(filterObj);

    // alternate way of filtering
    // const query = Tour.find().where(field).equals(value).where(field).lte(value)...;

    return this;
  }

  sort() {
    // sorting
    if (this.queryObj.sort) {
      const sortBy = this.queryObj.sort.replaceAll(",", " ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt"); // prefix with - for desc order
    }

    return this;
  }

  limit() {
    // limiting fields
    if (this.queryObj.fields) {
      // const fields = {};
      // this.queryObj.fields.split(",").forEach(el => (fields[el] = 1));

      const fields = this.queryObj.fields.replaceAll(",", " ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v"); // prefix with - to deselect it
    }

    return this;
  }

  paginate() {
    // pagination
    if (this.queryObj.page || this.queryObj.limit) {
      const page = this.queryObj.page * 1 || 1;
      const limit = this.queryObj.limit * 1 || 10;
      const skip = (page - 1) * limit;

      this.query = this.query.skip(skip).limit(limit);

      // if (skip >= (await Tour.countDocuments())) {
      //   throw new Error("No more tours to show");
      // }
    }

    return this;
  }
}

module.exports = APIFeatures;
