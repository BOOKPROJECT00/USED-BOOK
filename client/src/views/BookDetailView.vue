<template>
  <div>
    <div class="container">
      <div class="content-box col-10 m-auto mt-4">
        <div class="sub">
          <div class="book-category mb-2">{{ bookData?.categoryName }}</div>
          <div class="book-title">
            {{ bookData?.title }}
          </div>
          <div class="book-pubdate">출판일 : {{ bookData?.pubDate }}</div>
          <div class="book-publisher">출판사 : {{ bookData?.publisher }}</div>
          <div class="book-author">작가 : {{ bookData?.author }}</div>
          <div class="book-price">정가 : {{ bookData?.priceStandard }}원</div>
        </div>

        <div class="img">
          <img v-bind:src="bookData?.cover" alt="..." />
        </div>
        <div class="des">
          <div class="book-des" v-html="bookData?.description"></div>
          <button
            v-bind:disabled="!store.state.isLogin"
            class="btn btn-outline-success btn-add-library me-1 library"
            @click="divertAddOrDelete">
            <i v-show="!isLibraryCart" class="bi bi-bag-check"></i>
            <i v-show="isLibraryCart" class="bi bi-bag-check-fill"></i>
          </button>
        </div>
        <div class="used">
          <div class="used-title my-4">중고 리스트</div>
          <div v-show="!haveUsedList">등록된 중고책이 없습니다</div>
          <div class="sect-best-carousel-1" v-show="haveUsedList">
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
                  class="used-img"
                  :key="i"
                  v-for="(used, i) in usedList"
                  @click="moveToUsedBook(used.product_id)">
                  <UsedBookList
                    class="me-4"
                    :imgPath="imgSrc[i][0]"
                    bookType="used"
                    :status="used.total_status"
                    :price="used.price"
                    :location="used.location"></UsedBookList>
                </li>
              </ol>
            </div>
          </div>
        </div>
        <div class="best">
          <div class="bs-title">{{ bookData?.categoryName }} 베스트 셀러</div>
          <div class="sect-best-carousel-1">
            <button
              @click="carousel2('right')"
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
              @click="carousel2('left')"
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
              <ol class="d-flex carousel mb-5" ref="test2">
                <li class="product" :key="i" v-for="(product, i) in bestSeller">
                  <BookCard
                    class="me-4"
                    :category="product.categoryName"
                    :imgPath="product.cover"
                    :title="product.title"
                    :author="product.author"
                    @click="moveToBookDetail(product.isbn13)"></BookCard>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import UsedBookList from "@/components/UsedBookList.vue";
import BookCard from "@/components/BookCard.vue";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import { ref, onUpdated, computed } from "vue";
import { useStore } from "vuex";
import mixins from "@/mixins";

// import Type
import type CommonBook from "@/types/CommonBook";
import type UsedBook from "@/types/UsedBook";

const store = useStore();
const route = useRoute();
const router = useRouter();

const bookData = ref<CommonBook | null>(null);
const bookCategoryId = ref(0);
const bestSeller = ref<CommonBook[]>([]);
const bookId = ref("");
const haveUsedList = ref(false);
const imgSrc = ref<string[]>([]);
const test = ref<HTMLOListElement | null>(null);
const test2 = ref<HTMLOListElement | null>(null);
const usedListMore5 = ref(false);
const usedList = ref<UsedBook[]>([]);

const carousel = (dir: string) => {
  // type guard
  if (test.value) {
    if (dir === "left" && usedListMore5.value == true) {
      test.value.style.transform = `translateX(${
        -test.value.offsetWidth - 20
      }px)`;
    } else if (usedListMore5.value == true && dir === "right") {
      test.value.style.transform = `translateX(${0}px)`;
    }
  }
};
const carousel2 = (dir: string) => {
  if (test2.value) {
    if (dir === "left") {
      test2.value.style.transform = `translateX(${
        -test2.value.offsetWidth - 65
      }px)`;
    } else {
      test2.value.style.transform = `translateX(${0}px)`;
    }
  }
};

// setup이 mount보다 이전이니, 이 때 함수를 실행해도..?
bookId.value = route.query.id as string;
getBookDetailData(bookId.value);
getUsedBook(bookId.value);
// onMounted(() => {
// onBeforeMount(() => {
//   bookId.value = route.query.id;
//   console.log(bookId.value);
//   getBookDetailData(bookId.value);
//   getUsedBook(bookId.value);
// });

onUpdated(() => {
  const newBookId = route.query.id;
  if (bookId.value !== newBookId) {
    router.go(0);
  }
});

async function getBookDetailData(bookId: any) {
  // console.log(bookId);
  const result = await mixins.methods.$get(
    `http://localhost:3000/book/detail?id=${bookId}`
  );
  // console.log(result);
  bookData.value = result.item[0];
  bookCategoryId.value = result.item[0].categoryId;

  getBestSeller(bookCategoryId.value);
}

async function getBestSeller(categoryId: number) {
  const result = await axios
    .get("http://localhost:3000/book/best", {
      params: {
        categoryId: categoryId,
      },
    })
    .then((res) => res.data);
  bestSeller.value = result.item;
}
function moveToBookDetail(bookId: string) {
  window.scrollTo(0, 0);
  router.push({
    query: {
      id: bookId,
    },
  });
  getBookDetailData(bookId);
}
function moveToUsedBook(productId: any) {
  window.scrollTo(0, 0);
  router.push({
    name: "UsedBook",
    query: {
      id: productId,
    },
  });
}
async function getUsedBook(book_Id: any) {
  const result = await axios.get(`http://localhost:3000/used-book/bookDetail`, {
    params: {
      book_Id: book_Id,
    },
  });

  for (let i = 0; i < result.data.length; i++) {
    imgSrc.value.push(result.data[i].image_url_1.split(","));
  }
  // console.log(result.data); // [{}, {},,, {}]
  usedList.value = result.data;
  if (result.data.length > 0) {
    haveUsedList.value = true;
    if (result.data.length > 5) {
      usedListMore5.value = true;
    }
  }
}

function divertAddOrDelete() {
  if (isLibraryCart.value === false) {
    addLibrary();
  } else {
    deleteLibrary();
  }
}
async function addLibrary() {
  const result = await axios.post("http://localhost:3000/library/createBook", {
    param: {
      book_id: bookData.value?.isbn13, // 가드를 하긴했는데 이게 맞나?
      user_id: store.state.userInfo.user_id,
    },
  });
  if (result.status === 200) {
    store.commit("addLikeBookList", bookData.value);
    alert("찜하기 완료");
  }
  if (result.status !== 200) {
    alert("찜하기 실패!");
  }
}
async function deleteLibrary() {
  const result = await axios.delete(
    "http://localhost:3000/library/deleteBook",
    {
      params: {
        book_id: bookData.value?.isbn13,
        user_id: store.state.userInfo.user_id,
      },
    }
  );
  if (result.status === 200) {
    store.commit("deleteLikeBookList", bookData.value?.isbn13);
    alert("찜하기 취소");
  }
  if (result.status !== 200) {
    console.log("찜하기 취소 실패!");
  }
}

const isLibraryCart = computed(() => {
  // console.log(store.state.likeBookList);
  // return store.state.likeBookList.some(
  //   (book) => book.isbn13 === bookData.value.isbn13
  // );
  return false;
});
</script>

<style scoped>
.content-box {
  height: 100%;
  display: grid;
  grid-template-columns: 5fr 10fr;
  /* grid-template-rows: 1fr 3fr 2fr 2fr; */
  grid-template-areas:
    "img sub"
    "img des"
    "used used"
    "best best";
}

.book-title {
  font-size: 30px;
  margin-top: 15px;
  margin-bottom: 30px;
  line-height: 50px;
}
.sub {
  grid-area: sub;
  height: 100%;
  font-size: 16px;
  margin-top: 30px;
  margin-left: 10px;
  line-height: 30px;
}

.img {
  grid-area: img;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.img > img {
  width: 300px;
  height: 400px;
}
.des {
  height: 100%;
  grid-area: des;
  margin-top: 10px;
  margin-left: 10px;
  font-size: 18px;
  line-height: 25px;
  overflow-y: auto;
  font-weight: 700;
}
.library {
  float: right;
}
.used {
  grid-area: used;
  margin-top: 70px;
}
.used-title {
  font-size: 25px;
  font-weight: bold;
  margin-bottom: 10px;
}

div .used-info {
  width: 100%;
  display: inline-flex;
  flex-wrap: nowrap;
}
.used-tt {
  font-size: 15px;
}

.used-des {
  margin-left: 30px;
  line-height: 20px;
}
.best {
  grid-area: best;
  margin-top: 70px;
}

.bs-title {
  font-size: 25px;
  font-weight: bold;
  margin: 15px 0px;
}
.img-list {
  width: 100%;
  height: 250px;
  display: inline-flex;
  flex-wrap: nowrap;
}
.product-title {
  text-align: center;
}
.btn-add-library {
  font-size: 18px;
  height: 38px;
}
.btn-add-library:hover {
  background-color: #fff;
  color: #198754;
  text-decoration: none;
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
</style>
