<template>
  <div>
    <div class="bg">
      <div class="container">
        <div class="content-box">
          <div class="sort">
            <select
              class="form-select"
              aria-label="Default select example"
              v-model="sortType"
              @change="searchBook(searchName, sortType)">
              <option selected disabled>정렬</option>
              <option value="Accuracy">관련도</option>
              <option value="PublishTime">출간일</option>
              <option value="Title">제목</option>
              <option value="SalesPoint">판매량</option>
            </select>
          </div>
          <div class="main">
            <div class="book-card" v-for="item in listData" :key="item.isbn">
              <BookCard
                :category="item.categoryName"
                :imgPath="item.cover"
                :title="item.title"
                :author="item.author"
                @click="moveToBookDetail(item.isbn13)"></BookCard>
            </div>
            <div class="pag">
              <Pagination
                :pageSetting="pageDataSetting(total, limit, block, page)"
                @paging="pagingMethod"></Pagination>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import BookCard from "../components/BookCard.vue";
import Pagination from "@/components/layouts/Pagination.vue";
import { useRoute } from "vue-router";
import axios from "axios";

export default {
  components: { BookCard, Pagination },
  data() {
    return {
      searchName: "",
      searchList: [],
      sortType: "Accuracy",
      listData: [],
      total: 0,
      page: 1,
      limit: 10,
      block: 10,
      route: useRoute(),
    };
  },
  setup() {},
  created() {
    const route = useRoute();
    const query: any = route.query.q;
    this.searchName = query;
    this.searchBook(this.searchName, this.sortType);
  },
  mounted() {},
  unmounted() {},
  updated() {
    const route = useRoute();
    // console.log("update");
    this.searchName = route.query.q;
  },
  watch: {
    searchName(newVal, oldVal) {
      // console.log(oldVal, " => ", newVal);
      this.searchBook(newVal, this.sortType);
    },
  },
  methods: {
    async searchBook(query: string, sort: string) {
      const result = await axios.get("http://localhost:3000/book/search", {
        // TODO: startNum같은게 있어야 페이지네이션 가능
        params: {
          q: query,
          cnt: 50,
          s: sort,
        },
      });
      this.searchList = result.data.item;
      this.total = this.searchList.length;
      this.pagingMethod(this.page);
    },

    moveToBookDetail(bookId: number) {
      window.scrollTo(0, 0);
      this.$router.push({
        name: "book",
        query: {
          id: bookId,
        },
      });
    },
    pagingMethod(page: any) {
      this.listData = this.searchList.slice(
        (page - 1) * this.limit,
        page * this.limit
      );
      this.page = page;
      this.pageDataSetting(this.total, this.limit, this.block, page);
    },

    pageDataSetting(total: any, limit: any, block: any, page: any) {
      const totalPage = Math.ceil(total / limit);
      let currentPage = page;
      const first =
        currentPage > 1 ? parseInt(currentPage, 10) - parseInt(1, 10) : null;
      const end =
        totalPage !== currentPage
          ? parseInt(currentPage, 10) + parseInt(1, 10)
          : null;

      let startIndex = (Math.ceil(currentPage / block) - 1) * block + 1;
      let endIndex =
        startIndex + block > totalPage ? totalPage : startIndex + block - 1;
      let list = [];
      for (let index = startIndex; index <= endIndex; index++) {
        list.push(index);
      }
      return { first, end, list, currentPage };
    },
  },
};
</script>

<style scoped>
.content-box {
  padding: 30px;
}

.main {
  display: flex;
  flex-wrap: wrap;
  height: 90%;
}
.sort {
  width: 100px;
  height: 50px;
  margin-left: 20px;
}
.book-card {
  width: 200px;
  margin: 20px;
}
.pag {
  width: 100%;
  height: 50px;
  margin-top: 50px;
  display: flex;
  justify-content: center;
}
</style>
