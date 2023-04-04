<template>
  <div class="card card-normal">
    <div class="book-img-wrapper">
      <img class="book-img" :src="props.imgPath" alt="책커버이미지" />
    </div>
    <div class="card-body">
      <div class="book-desc-wrapper">
        <div class="text-muted mb-3">{{ convertedCategory }}</div>
        <h3 class="card-title ellipsis mb-3">{{ convertedTitle }}</h3>
        <span class="card-subtitle ellipsis text-muted">{{
          props.author
        }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

// "타입 기반 선언(type-based declaration)"이라고 합니다. 컴파일러는 타입 전달인자를 기반으로 같은 런타임 옵션을 추론 하도록 시도합니다
const props = defineProps<{
  category: string;
  imgPath: string;
  title: string;
  author: string;
}>();

// defineProps()에 전달된 인자가 런타임 props 옵션으로 사용되기 때문에 이것을 "런타임 선언(runtime declaration)"이라고 합니다.
// const props = defineProps({
//   category: String,
//   imgPath: String,
//   title: String,
//   author: String,
// });

// prettier-ignore
const convertString = (targetString: string, targetIndex: number, seperator: string): string => {
  if (targetString === undefined) {
    return "no-data";
  }
  if (targetString.split(seperator)[targetIndex] === undefined) {
    return targetString;
  }
  return targetString.split(seperator)[targetIndex];
};

const convertedCategory = computed(() => convertString(props.category, 1, ">"));
const convertedTitle = computed(() => convertString(props.title, 0, "-"));
</script>

<style scoped>
img {
  width: 100%;
}
.card {
  cursor: pointer;
  transition: all ease-in-out 0.1s;
  width: 200px;
}
.card-normal {
  overflow: hidden;
}
.card-normal .book-img-wrapper {
  height: 260px;
  overflow: hidden;
}
.ellipsis {
  height: 2em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.card-normal .text-muted {
  font-size: 12px;
}
.card-body {
  padding: 10px;
}
</style>
