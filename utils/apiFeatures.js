class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  // Search feature case insensetive
  searchFeature() {
    const keyword = this.queryStr.keyword
      ? {
          search: {
            $regex: this.queryStr.keyword,
            $options: "i",
          },
        }
      : {};
    this.query = this.query
      .find({
        $or: [{ title: keyword.search }, { text: keyword.search }],
      })
      .select("coverImage createdAt")
      .populate("user", "email");
    return this;
  }

  // pagination according to how many blog post you want
  paginationFeature(resultsPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resultsPerPage * (currentPage - 1);
    this.query = this.query.limit(resultsPerPage).skip(skip);
    return this;
  }
}

module.exports = ApiFeatures;
