<template>
  <div>
    <div class="container mb-4">
      <div class="content-box" v-show="chatList.length > 0">
        <!-- 채팅리스트 -->
        <div class="aside">
          <ul
            v-for="(chat, i) in chatList"
            :key="i"
            class="room-list"
            :class="{ current: currentRoom == chat.chat_id }"
            @click="
              currentRoom != chat.chat_id
                ? changeRoom(
                    user.user_id,
                    user.user_nickname,
                    chat.chat_id,
                    prevRoom
                  )
                : null
            ">
            <img
              :src="chat.opponent_data[0].user_image"
              alt="로딩중"
              class="room-img ms-2" />

            <li class="room-name ms-2">
              {{ chat.opponent_data[0].user_nickname }}
            </li>
          </ul>
        </div>

        <!-- 채팅 -->

        <div class="main" ref="chatArea">
          <div class="msg" ref="refscrollHeight">
            <div
              class="chat-messages"
              :class="{
                me: msg.sender_id === user.user_id,
                other: msg.sender_id !== user.user_id,
              }"
              v-for="(msg, i) in msgData"
              :key="i"
              ref="msg00">
              <div
                class="message"
                :class="{
                  me: msg.sender_id === user.user_id,
                  other: msg.sender_id !== user.user_id,
                }">
                <div class="chat-user mb-2">
                  <img
                    class="chat-user-img me-2"
                    :src="msg.user_image"
                    alt="" />
                  <div class="meta me-2">
                    <span>{{ msg.user_nickname }}:</span>
                  </div>
                </div>
                <div class="msg-text mb-2">
                  <p class="text me-2">{{ msg.msg }}</p>
                </div>
                <p class="text msg-time">{{ msg.time }}</p>
              </div>
            </div>
          </div>
          <form class="input-form" @submit.prevent="sendMsg(this.newMsg)">
            <input
              class="input-msg me-2"
              type="text"
              placeholder="Enter Message"
              v-model="newMsg"
              autocomplete="off" />
            <button class="btn send-btn">
              <i class="fas fa-paper-plane"></i> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import io from "socket.io-client";
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import axios from "axios";
const socket = io("http://localhost:3000");

export default {
  emits: ["update:message"],
  components: {},
  data() {
    return {
      chatId: "",
      newMsg: "",
      totalChat: 0,
    };
  },
  setup() {
    const store = useStore();
    let user = store.state.userInfo;
    let chatArea = ref(null);
    let refscrollHeight = ref(null);
    let currentRoom = ref(0);
    let sendMsgData = ref([]);
    let chatList = ref([]);
    let chatContent = ref([]);
    let firstRoom = ref(0);
    let prevRoom = ref(0);
    const route = useRoute();

    currentRoom.value = Number(route.query.id);
    const scroll = async () => {
      msgData.value.push(sendMsgData.value);
      let chat2 = await refscrollHeight.value;
      chat2.scrollTo({ top: chat2.scrollHeight, behavior: "smooth" });
    };

    const msgData = ref([]);
    socket.on("msg3", async (data) => {
      sendMsgData.value = data;
      // chat-content db등록
      // if (currentRoom.value != null) {
      //   ;
      // }
      scroll();
    });

    const getChatList = async () => {
      const result = await axios.get(`http://localhost:3000/chat/list`, {
        params: {
          user_id: user.user_id,
        },
      });
      chatList.value = result.data;
      for (let i = 0; i < chatList.value.length; i++) {
        chatList.value[i].user_list = chatList.value[i].user_list.split(",");
        for (let j = 0; j < 2; j++) {
          if (chatList.value[i].user_list[j] != user.user_id) {
            chatList.value[i].opponent_id = chatList.value[i].user_list[j];
            const getOpponetId = async () => {
              const result2 = await axios.get(
                `http://localhost:3000/chat/user`,
                {
                  params: {
                    user_id: chatList.value[i].opponent_id,
                  },
                }
              );

              chatList.value[i].opponent_data = result2.data;
            };
            getOpponetId();
          }
        }
      }
      if (isNaN(currentRoom.value)) {
        currentRoom.value = chatList.value[0].chat_id;
        prevRoom.value = currentRoom.value;
      }
      // chat 페이지 진입시 socket에 자동연결되는 chat_id
      socket.emit(
        "autoJoin",
        user.user_id,
        user.user_nickname,
        currentRoom.value
      );
      getChatContent();
    };
    getChatList();
    // 첫페이지 진입시 제일 위 채팅창
    const getChatContent = async () => {
      const result = await axios.get(`http://localhost:3000/chat/content`, {
        params: {
          chat_id: currentRoom.value,
        },
      });

      chatContent.value[0] = [];
      chatContent.value[0] = result.data;
      msgData.value = [];
      msgData.value = chatContent.value[0];

      const scroll2 = async () => {
        let chat = await refscrollHeight.value;
        chat.scrollTo({ top: chat.scrollHeight, behavior: "smooth" });
      };
      scroll2();
    };
    const getProductData = async (data) => {
      const result = await axios.get(
        `http://localhost:3000/used-book`,
        data.product_id
      );
    };
    return {
      msgData,
      scroll,
      chatArea,
      refscrollHeight,
      currentRoom,
      user,
      getChatList,
      chatList,
      getProductData,
      getChatContent,
      firstRoom,
      prevRoom,
      chatContent,
      sendMsgData,
    };
  },
  created() {},
  mounted() {},
  unmounted() {
    socket.emit("leaveRoom", this.currentRoom);
    this.msgData = [];
    this.currentRoom = null;
    this.chatList = [];
  },
  updated() {},
  // computed: {
  //   userInfo() {
  //     return this.$store.state.userInfo;
  //   },
  // },

  methods: {
    changeRoom(user_id, user_nickname, chat_id, prev) {

      socket.emit("leaveRoom", prev);
      this.msgData = [];
      this.prevRoom = this.currentRoom;
      if (this.currentRoom !== chat_id) {
        console.log(`changeRoom ${user_id} // ${chat_id}`);

        this.$router.push({
          query: {
            id: chat_id,
          },
        });

        this.currentRoom = chat_id;
        socket.emit("joinRoom", { user_id, user_nickname, chat_id, prev });
        this.getChatContent();
      }
    },
    // scroll() {
    //   let chat = this.$refs.refscrollHeight.value;
    //   // console.log(chat);
    //   // chat[this.totalChat - 1].scrollIntoView({ behavior: "smooth" });
    //   // chat.scrollTop = chat.clientHeight;
    //   // console.log(chat.scrollHeight);
    //   // window.scrollBy(0, chat.clientHeight);
    //   // chat.scrollIntoView(false);
    //   chat.scrollTo({ top: chat.scrollHeight, behavior: "smooth" });
    // },
    // const scroll = () => {
    //     // console.log(data);
    //     let chat = refscrollHeight.value;
    //     console.log(chat);
    //     chat.scrollTo({ top: chat.scrollHeight, behavior: "smooth" });
    //   };
    msgHeight() {
      let chatHeight = this.$refs.refscrollHeight;

      chatHeight.scrollTo({
        top: chatHeight.scrollHeight,
        behavior: "smooth",
      });
    },
    sendMsg(msg) {
      if (this.currentRoom != 0) {

        let date = new Date();
        let month = date.getMonth();
        let day = date.getDate();
        let hours = date.getHours();
        let min = date.getMinutes();
        let time = month + "월" + day + "일" + "  " + hours + "시" + min + "분";

        const ResMsg = async () => {
          await axios.post(`http://localhost:3000/chat/sendMsg`, {
            param: [
              {
                chat_id: this.currentRoom,
                sender_id: this.user.user_id,
                msg: msg,
                time: time,
              },
            ],
          });
        };
        ResMsg();
        socket.emit("chatMsg", msg, time, this.user.user_image);
        this.newMsg = "";
      }
    },
  },
};
</script>

<style scoped>
.content-box {
  margin-top: 20px;
  width: 1300px;
  height: 90vh;
  display: grid;
  grid-template-columns: 2fr 10fr;
  grid-template-areas: "aside main";
  gap: 5px;
}
.content-box2 {
  width: 1300px;
  height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
.empty-text {
  font-size: 24px;
}
.empty-img {
  width: 50%;
  height: 50%;
}
.aside {
  grid-area: aside;
  border: 1px solid black;
  padding: 10px;
  border-radius: 4px;
}
.room-list {
  margin-bottom: 30px;
  display: flex;
}
.room-list.current {
  border: 4px solid #e6e9ff;
  background: #e6e9ff;
  border-radius: 4px;
}
.room-list:first-child {
  margin-top: 20px;
}
.room-img {
  width: 50px;
  height: 50px;
  border-radius: 10px;
}
.room-name {
  display: flex;
  align-items: center;
}
.main {
  border: 1px solid black;
  padding: 10px;
  grid-area: main;
  border-radius: 4px;
  height: 100%;
}
.msg {
  height: 80vh;
  border-bottom: 1px solid black;
  display: inline-block;
  width: 100%;
  overflow: auto;
}
.input-form {
  display: flex;
  align-items: center;
  width: 100%;
  height: 10%;
}
.input-msg {
  height: 70%;
  width: 80%;
  border: 2px solid gainsboro;
}
.send-btn {
  height: 70%;
  border: 2px solid gainsboro;
}

.chat-messages {
  display: flex;
  padding: 20px;
  width: 100%;
}
.chat-messages.other {
  justify-content: flex-end;
}
.message.me,
.message.other {
  min-width: 20%;
  max-width: 50%;
  padding: 20px;
  margin-bottom: 5px;

  border-radius: 5px;
}

.message.me {
  background-color: #e6e9ff;
}
.message.other {
  background-color: #d7f1f7;
}
.chat-messages .message .meta {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 7px;
}

.chat-user-img {
  width: 30px;
  height: 30px;
  border-radius: 20px;
}
.msg-text {
  display: flex;
  align-items: center;
}
.msg-time {
}
.chat-user {
  display: flex;
  align-items: center;
}
</style>
