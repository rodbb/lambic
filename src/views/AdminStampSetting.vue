<template>
  <v-layout row class="pb-5">
    <v-flex>
      <v-card class="mb-2">
        <v-card-title>
          <h1 class="headline">スタンプ登録</h1>
        </v-card-title>
        <v-form ref="form">
          <v-container fluid class="py-1">

            <v-layout row class="py-2">
              <v-flex xs12 md7>
                <v-card flat v-if="src !== ''">
                  <v-img :src="src"></v-img>
                  <v-btn @click="deleteStamp()"><v-icon>delete</v-icon>削除</v-btn>
                </v-card>
                <v-card flat v-else>
                  <input type="file" accept="image/*" ref="file" @change="uploadStamp()">
                </v-card>
              </v-flex>
            </v-layout>

            <v-layout row class="py-2">
              <v-flex xs12 md7>
                <v-text-field
                  v-model="string"
                  label="altテキスト"
                  outline
                  required
                ></v-text-field>
              </v-flex>
            </v-layout>

            <v-layout row class="py-2">
              <v-flex xs12 md7>
                有効にする
                <v-switch
                  v-model="canUse"
                  :label="`${ canUse ? 'はい' : 'いいえ' }`"
                  color="green"
                  hide-details
                  class="pt-0 mt-1"
                >
                </v-switch>
              </v-flex>
            </v-layout>

          </v-container>
        </v-form>
      </v-card>

      <v-btn
        @click="submit"
        :disabled="src === ''"
        color="orange"
        block
        large
        class="my-2 white--text"
      >
        登録内容を確定する
      </v-btn>

      <v-btn
        fixed
        fab
        bottom
        left
        color="green"
        :to="{ path: '/admin/stamps' }"
      >
        <v-icon>arrow_back</v-icon>
      </v-btn>

    </v-flex>
  </v-layout>
</template>
<script>
const NEW_STAMP_KEYWORD = 'new'
export default {
  name: 'adminStampSetting',
  props: {
    id: {
      type: String,
      required: false
    }
  },
  data () {
    return {
      isNewStamp: false,
      committedRef: '', // 確定したファイルのreference
      src: '', // スタンプ画像のURL
      string: '', // スタンプのaltテキスト
      fullPath: '', // storageのフルパス
      canUse: false, // 使用可能か
      fileRefs: [] // アップロードしたファイルのreference（削除のため確保）
    }
  },
  async created () {
    window.addEventListener('beforeunload', this.handler)
    // 初期値を設定
    this.isNewStamp = this.id === NEW_STAMP_KEYWORD
    const stamp = this.isNewStamp ? null : this.$store.getters.stamp(this.id)
    if (stamp) {
      this.committedRef = await this.$store.dispatch('getStampRef', stamp.fullPath)
      this.src = stamp.src
      this.string = stamp.string
      this.fullPath = stamp.fullPath
      this.canUse = stamp.canUse
    }
  },
  computed: {
    stamp () {
      return this.isNewStamp ? null : this.$store.getters.stamp(this.id)
    }
  },
  methods: {
    /**
     * ブラウザを閉じたときに不要ファイルを削除するハンドラ
     * @param {Event} event
     */
    handler (event) {
      event.preventDefault()
      deleteFiles(this.fileRefs, this.committedRef)
    },
    /**
     * スタンプ画像をアップロードする
     */
    uploadStamp () {
      const fileList = Object.values(this.$refs.file.files)
      fileList.forEach(async (file) => {
        const uploadTask = await this.$store.dispatch('uploadStamp', file)
        const fileRef = uploadTask.ref
        this.fileRefs.push(fileRef)
        const bucketName = encodeURIComponent(fileRef.bucket)
        const fullPath = encodeURIComponent(fileRef.fullPath)
        this.src = 'https://firebasestorage.googleapis.com/v0/b/' + bucketName + '/o/' + fullPath + '?alt=media'
        this.fullPath = fullPath
      })
    },
    /**
     * 使用するスタンプ画像をクリアする
     */
    deleteStamp () {
      this.src = ''
      this.fullPath = ''
    },
    /**
     * 確定処理を行う
     */
    async submit () {
      if (!this.src || !this.string) {
        return
      }
      const stamp = {
        src: this.src,
        string: this.string,
        fullPath: this.fullPath,
        canUse: this.canUse
      }
      if (this.isNewStamp) {
        this.$store.dispatch('addStamp', stamp)
      } else {
        this.$store.dispatch('updateStamp', {
          stampId: this.id,
          stamp: stamp
        })
      }
      this.committedRef = await this.$store.dispatch('getStampRef', this.fullPath)
      this.$router.push({ path: '/admin/stamps' })
    }
  },
  beforeDestroy () {
    deleteFiles(this.fileRefs, this.committedRef)
    window.removeEventListener('beforeunload', this.handler)
  }
}

/**
 * 確定したファイル以外のアップロードしたファイルを全削除する
 * @param {firebase.storage.Reference[]} fileRefs アップロードしたファイルのreference
 * @param {firebase.storage.Reference} committedRef 確定したファイルのreference
 */
function deleteFiles (fileRefs, committedRef) {
  try {
    fileRefs.forEach(async (fileRef) => {
      if (fileRef.fullPath !== committedRef.fullPath) {
        await fileRef.delete()
      }
    })
  } catch (err) {
    console.log(err)
  }
}
</script>
