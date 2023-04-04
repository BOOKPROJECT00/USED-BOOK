<template>
  <div>
    <div class="main-search-wrapper">
      <form @submit.prevent="submitBookSearchInput">
        <input
          class="main-search-inp"
          :class="{ header: !isHomeRoute }"
          type="text"
          placeholder="검색어를 입력하세요"
          :value="searchBookQuery"
          @input="searchBook" />
        <button type="submit" class="main-search-btn">
          <i class="bi bi-search h5"></i>
        </button>
      </form>
      <div v-if="selectBookData">
        <BookCard
          class="mt-3"
          :category="selectBookData.categoryName"
          :imgPath="selectBookData.cover"
          :title="selectBookData.title"
          :author="selectBookData.author"></BookCard>
      </div>
      <!-- 리스트가 보이는게 포커스 되었을때만 보이고, 서브밋 되면 블러(포커스아웃)처리 -->
      <ul class="list-group position-absolute mt-1" v-if="bookSearchResults">
        <!-- TODO: error handle -->
        <p class="list-group-item list-group-item-action" v-if="false">
          error!
        </p>
        <p
          class="list-group-item list-group-item-action"
          v-if="bookSearchResults.length === 0">
          no matching!
        </p>
        <template v-else>
          <li
            class="list-group-item list-group-item-action"
            v-for="book in bookSearchResults"
            :key="book.isbn"
            @click="divertMoveOrSelect(book.isbn13)">
            {{ book.title }}
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import BookCard from "@/components/BookCard.vue";
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";

// types
import type CommonBook from "@/types/CommonBook";

const router = useRouter();
const route = useRoute();

const searchBookQuery = ref("");
const queryTimeout = ref(0);
const bookSearchResults = ref<CommonBook[] | null>(null);

const searchBook = (e: Event) => {
  searchBookQuery.value = (e.target as HTMLInputElement).value;
  clearTimeout(queryTimeout.value);
  // 셋 타임 아웃은 고유 아이디를 뱉어냅니다
  // 이 고유 아이디를 클리어 타임아웃에 넣어주면 실행을 취소 합니다
  queryTimeout.value = setTimeout(async () => {
    if (searchBookQuery.value !== "") {
      const result = await axios.get("http://localhost:3000/book/search", {
        params: {
          q: searchBookQuery.value,
          // TODO: 라우트에 따른 반환갯수 조절
          // cnt: 10,
        },
      });
      bookSearchResults.value = result.data.item;
    } else {
      bookSearchResults.value = null;
    }
  }, 500);
};

const isCreateRoute = computed(() => route.path === "/used-book/create");

const submitBookSearchInput = () => {
  if (isCreateRoute.value) {
    return;
  }
  if (validateBookSearchInput(searchBookQuery.value)) {
    router.push({
      name: "search",
      query: {
        q: searchBookQuery.value,
      },
    });
    const inp: HTMLInputElement | null =
      document.querySelector(".main-search-inp");
    if (inp) {
      inp.blur();
    }
    searchBookQuery.value = "";
  }
};

const validateBookSearchInput = (input: string) => {
  if (input.length === 0) return false;
  return true;
};

const moveToBookDetail = (bookid: string) => {
  router.push({
    name: "book",
    query: {
      id: bookid,
    },
  });
};

const isHomeRoute = computed(() => route.path === "/");

const body = document.getElementById("app");
body!.addEventListener("click", (e: Event) => {
  if (!(e.target as HTMLElement).classList.contains("list-group-item")) {
    bookSearchResults.value = null;
  }
});

// 페이지이동인지 중고등록 때 선택인지 반환하는 함수
const divertMoveOrSelect = (bookid: string) => {
  if (isCreateRoute.value) {
    selectBook(bookid);
  } else if (!isCreateRoute.value) {
    moveToBookDetail(bookid);
  }
};

const selectBookData = ref<CommonBook | null>(null);
const emit = defineEmits(["sendBookId"]);
const selectBook = async (bookid: string) => {
  const result = await axios.get(
    `http://localhost:3000/book/detail?id=${bookid}`
  );
  if (result.status === 200) {
    selectBookData.value = result.data.item[0];
    searchBookQuery.value = selectBookData.value!.title;
  }
  emit("sendBookId", bookid);
  bookSearchResults.value = null;
};
</script>

<style scoped>
.main-search-wrapper form {
  position: relative;
}
.main-search-wrapper.header {
  width: 180px;
}
.main-search-inp {
  width: 100%;
  padding: 14px 24px;
  border-radius: 28px;
  line-height: 22px;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  transition: box-shadow 0.2s ease-in-out;
}
.main-search-inp:hover {
  box-shadow: rgba(0, 0, 0, 0.24) 0px 12px 18px;
}
.main-search-inp:focus {
  box-shadow: rgba(0, 0, 0, 0.24) 0px 8px 12px;
  outline: solid #457e2b;
}
.main-search-inp.header {
  border-radius: 3px;
  border: 1px solid #bdbdbd;
  padding: 8px 12px;
  font-size: 14px;
  box-shadow: none;
}
.main-search-btn {
  position: absolute;
  top: 50%;
  right: 3%;
  transform: translateY(-45%);
}

.list-group {
  width: 100%;
  z-index: 10;
}
.list-group .list-group-item {
  width: 100%;
}
</style>
