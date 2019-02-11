import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    user: {
      name: 'tester'
    },
    events: [
      {
        id: 'C5ebplhPZw1gz7K0GNc9',
        date: {
          seconds: 1545125400,
          nanoseconds: 0
        },
        description: '2018年12月ビアバッシュ2018年12月ビアバッシュ\n2018年12月ビアバッシュ2018年12月ビアバッシュ',
        title: '2018年12月ビアバッシュ'
      },
      {
        id: 'e6KxxsGk6MaviDU1cQsj',
        date: {
          seconds: 1548149400,
          nanoseconds: 0
        },
        description: '2019年1月ビアバッシュ2019年1月ビアバッシュ\n2019年1月ビアバッシュ2019年1月ビアバッシュ',
        title: '2019年1月ビアバッシュ'
      }
    ],
    presentations: [
      {
        id: 'pjXhKy17f2Gkzti3RQBD',
        description: 'メタ構文変数（メタこうぶんへんすう、metasyntactic variable）はプログラミング言語の記述で使われる識別子の一種。サンプルプログラムなどで意味のない名前が必要な場合に利用される、「意味のない名前」であることが広く知られた識別子のことである。',
        eventId: 'C5ebplhPZw1gz7K0GNc9',
        presenter: {
          name: 'user1'
        },
        title: 'メタ構文変数'
      },
      {
        id: 'zvwNrwjQHXVR274aZ8Sq',
        description: '孫家駅（そんかえき）とは、中華人民共和国黒竜江省ハルビン市香坊区に位置する拉浜線、王孫線の駅。',
        eventId: 'C5ebplhPZw1gz7K0GNc9',
        presenter: {
          name: 'user2'
        },
        title: '孫家駅'
      },
      {
        id: 'vyzutlg2Uu4U8iAbqjN5',
        description: 'グレッグ・ビッフル（Gregory Jack "Greg" Biffle 1969年12月23日 - ）は、アメリカ合衆国（ワシントン州）出身のNASCARドライバー。2010年は、Roush Fenway Racing（フォード）より、スプリントカップシリーズに参戦。',
        eventId: 'e6KxxsGk6MaviDU1cQsj',
        presenter: {
          name: 'user1'
        },
        title: 'グレッグ・ビッフル'
      }
    ],
    comments: [
      {
        id: 'CjWLgmiaP8zQKU55bYYb',
        comment: 'The Vue Handbook: a thorough introduction to Vue.js\nhttps://medium.freecodecamp.org/the-vue-handbook-a-thorough-introduction-to-vue-js-1e86835d8446 …\n#Vuejs #Javascript #nodejs #vue #AndroidDev #developerguide #Vuetify #programming #coder #html #development #webdevelopment',
        postedAt: {
          seconds: 1548151414,
          nanoseconds: 0
        },
        presentationId: 'pjXhKy17f2Gkzti3RQBD',
        userRef: {
          name: 'user2'
        }
      },
      {
        id: 'k7UrxFEgtQ8z4ABRBoea',
        comment: 'Printing five times five as opposed to printing five five times, is the difference between 25 and 55555.\n\nThe fine (command) line between life and death of a computer. 😐',
        postedAt: {
          seconds: 1548151424,
          nanoseconds: 0
        },
        presentationId: 'pjXhKy17f2Gkzti3RQBD',
        userRef: {
          name: 'user3'
        }
      },
      {
        id: '2wxxO70yWCcds4Sc8NoH',
        comment: '【レガシーコードをリファクタリングするための必須概念を学ぶ】名著『レガシーコード改善ガイド』を理解し実践する上で重要な「接合部（Seam）」をコード片も交えて解説しています。まだちゃんと理解していない人は要チェック！！ #技術的負債とダンスを',
        postedAt: {
          seconds: 1548151434,
          nanoseconds: 0
        },
        presentationId: 'zvwNrwjQHXVR274aZ8Sq',
        userRef: {
          name: 'user1'
        }
      },
      {
        id: 'wgpxyS3Cea3ySjDVlGQn',
        comment: '現在の仕事でも、パソコンを始めとする機械を使うことが一般的になっています。これら機械をただ使うのではなく、システムを理解して制御や運用していくことが求められているのです。そのため、ただ使い方を学ぶのではなくて、システムを動かす本質であるプログラミングを学ぶことが求められています',
        postedAt: {
          seconds: 1548151444,
          nanoseconds: 0
        },
        presentationId: 'vyzutlg2Uu4U8iAbqjN5',
        userRef: {
          name: 'user2'
        }
      }
    ]
  },
  getters: {
    events (state, getters) {
      return state.events
        .map((ev) => {
          return {
            ...ev,
            id: ev.id,
            presentations: getters.presentations
              .filter((pr) => pr.eventId === ev.id)
          }
        })
    },
    presentations (state, getters) {
      return state.presentations
        .map((pr) => {
          return {
            ...pr,
            id: pr.id,
            comments: getters.comments
              .filter((cm) => cm.presentationId === pr.id)
          }
        })
    },
    comments (state) {
      return state.comments
    },
    event (state, getters) {
      return (id) => getters.events.find((e) => e.id === id)
    },
    presentation (state, getters) {
      return (id) => getters.presentations.find((e) => e.id === id)
    },
    comment (state, getters) {
      return (id) => getters.comments.find((e) => e.id === id)
    }
  },
  mutations: {
    setUser (state, payload) {
      state.user = payload
    },
    appendComment (state, payload) {
      state.comments.push(payload)
    }
  },
  actions: {
    setUser ({ commit }, userRef) {
      commit('setUser', userRef)
    },
    appendComment ({ state, commit }, { comment, presentationId }) {
      const chrs = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      const dt = new Date().getTime() // milliseconds
      commit('appendComment', {
        id: Array(20)
          .fill(null)
          .map(() => chrs[Math.floor(Math.random() * chrs.length)])
          .join(''),
        comment,
        postedAt: {
          seconds: Math.floor(dt / 1000),
          nanoseconds: (dt % 1000) * 1000000
        },
        presentationId,
        userRef: state.user
      })
    }
  }
})
