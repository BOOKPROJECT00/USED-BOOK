<template>
  <div class="container">
    <section class="sect-search col-10">
      <p class="search-tit h1">
        책을 검색할 수 있고,<br />중고 판매와 구매가 가능해요
      </p>
      <BookSearchInput></BookSearchInput>
    </section>
    <section class="sect-best-seller col-10">
      <p class="h2 mb-4">
        <span class="text-success">{{ bestCategory.name }} </span>&nbsp;분야에서
        인기있는 책들이에요
      </p>
      <ul class="d-flex flex-wrap mb-4">
        <li v-for="(code, name) in BOOK_CODE" :key="code">
          <button
            class="btn-category"
            :class="{ active: bestCategory.code === code }"
            @click="selectCategory(code, name)">
            {{ name }}
          </button>
        </li>
      </ul>

      <div class="sect-best-carousel-1">
        <button
          @click="carousel('right')"
          class="btn-carousel btn-carousel-left">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-chevron-left"
            viewBox="0 0 16 16">
            <path
              fill-rule="evenodd"
              d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
          </svg>
        </button>
        <button
          @click="carousel('left')"
          class="btn-carousel btn-carousel-right">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-chevron-right"
            viewBox="0 0 16 16">
            <path
              fill-rule="evenodd"
              d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
          </svg>
        </button>
        <div class="sect-best-carousel">
          <ol class="d-flex carousel" ref="test">
            <li
              v-for="item in bestSellerList"
              :key="item.isbn"
              ref="carousel-section"
              class="">
              <BookCard
                :category="item.categoryName"
                :imgPath="item.cover"
                :title="item.title"
                :author="item.author"
                @click="moveToBookDetail(item.isbn13)"></BookCard>
            </li>
          </ol>
        </div>
      </div>
    </section>
    <section class="sect-around col-8">
      <p class="h2 text-center">내 주변에는 이런 책들이 있어요</p>
      <KakaoMapComponent
        v-if="usedBookList !== null"
        :used-book-list="usedBookList"
        @emit-map-router="moveToUsedDetail"
        @emit-map-render="renderNearby"></KakaoMapComponent>
      <ul>
        <li
          class="card-used_book"
          v-for="usedBook in usedBookListRender"
          :key="usedBook.product_id">
          <UsedBookCard
            :title="usedBook.title"
            :location="usedBook.location"
            :seller_user_nickname="usedBook.seller_user_nickname"
            :price="usedBook.price"
            :category-name="usedBook.categoryName"
            :cover="usedBook.cover"
            @click="moveToUsedDetail(usedBook.product_id)"></UsedBookCard>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import BookCard from "@/components/BookCard.vue";
import UsedBookCard from "@/components/UsedBookCard.vue";
import BookSearchInput from "@/components/BookSearchInput.vue";
import KakaoMapComponent from "@/components/KakaoMapComponent.vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { ref } from "vue";
import { BOOK_CODE } from "@/store/BookCode";

// types
import type CommonBook from "@/types/CommonBook";
import type UsedBook from "@/types/UsedBook";

const router = useRouter();

const bestCategory = ref({ code: 351, name: "컴퓨터" });
const bestSellerList = ref<CommonBook[]>([]);

const getBestSeller = async (categoryId: number) => {
  const result = await axios
    .get("http://localhost:3000/book/best", {
      params: {
        categoryId: categoryId,
      },
    })
    .then((res) => res.data);
  bestSellerList.value = result.item;
};

getBestSeller(bestCategory.value.code);

const selectCategory = (categoryId: number, name: string) => {
  bestCategory.value.code = categoryId;
  bestCategory.value.name = name;
  getBestSeller(bestCategory.value.code);
};

const moveToBookDetail = (bookid: any) => {
  window.scrollTo(0, 0);
  router.push({
    name: "book",
    query: {
      id: bookid,
    },
  });
};

const test = ref<HTMLOListElement | null>(null);
const carousel = (dir: "left" | "right") => {
  if (test.value) {
    if (dir === "left") {
      test.value.style.transform = `translateX(${
        -test.value.offsetWidth - 20
      }px)`;
    } else {
      test.value.style.transform = `translateX(${0}px)`;
    }
  }
};

const usedBookList = ref<UsedBook[] | null>(null);
// const usedBookList = ref<UsedBook[]>([]);

const getAllUsedBook = async () => {
  const result = await axios("http://localhost:3000/used-book/all");
  const data = result.data;
  // console.log(data);
  usedBookList.value = data;
};

getAllUsedBook();

const moveToUsedDetail = (usedId: string) => {
  window.scrollTo(0, 0);
  router.push({
    name: "UsedBook",
    query: {
      id: usedId,
    },
  });
};

const usedBookListRender = ref<UsedBook[]>([]);
const renderNearby = (param: UsedBook) => {
  console.log("succeess", param);
  usedBookListRender.value.push(param);
};
</script>
<style scoped>
.d-flex {
  gap: 20px;
}
/* 메인 검색 영역 */
.sect-search {
  margin: 0 auto;
  padding-block: 15vh;
}
.sect-search .search-tit {
  margin-bottom: 6vh;
}
/* 베스트셀러 영역 */
.sect-best-seller {
  padding-block: 36px;
  margin: 0 auto 24px;
}
.btn-category {
  border: 1px solid #222222;
  border-radius: 8px;
  color: #222222;
  font-weight: 600;
  line-height: 20px;
  margin: 0;
  padding: 13px 23px;
  outline: none;
  text-decoration: none;
  transition: box-shadow 0.2s, -ms-transform 0.1s, -webkit-transform 0.1s,
    transform 0.1s, background-color 0.1s, color 0.1s;
  width: auto;
}
.btn-category:focus-visible {
  box-shadow: #222222 0 0 0 2px, rgba(255, 255, 255, 0.8) 0 0 0 4px;
  transition: box-shadow 0.2s;
}

.btn-category:active {
  background-color: #f7f7f7;
  border-color: #000000;
  transform: scale(0.96);
}
.btn-category:hover,
.btn-category.active {
  border: 1px solid #457e2b;
  background-color: #457e2b;
  color: #fff;
}
.sect-best-carousel-1 {
  position: relative;
}

.sect-best-carousel {
  overflow-x: hidden;
}
.btn-carousel {
  position: absolute;
  top: 50%;
  z-index: 10;
  width: 2rem;
  height: 2rem;
  background-color: #ffffff;
  border: 1px solid rgb(109, 109, 109);
  border-radius: 50%;
}
.btn-carousel-left {
  left: -1rem;
}
.btn-carousel-right {
  right: -1rem;
}

.carousel {
  transition: all 0.4s ease-in-out;
}
/* 내 주변 중고도서 영역 */
.sect-around {
  margin: 0 auto;
  padding-block: 36px;
}
.card-used_book {
  margin-bottom: 0.8rem;
}
.card-used_book:first-child {
  margin-top: 0.8rem;
}
.card-used_book:last-child {
  margin-bottom: 0;
}
</style>
