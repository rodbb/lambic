<template>
  <router-view></router-view>
</template>

<script>
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

export default {
  name: 'sub-app',
  beforeCreate () {
    const firestore = firebase.firestore()
    firestore.settings({})
    firebase
      .auth()
      .signInAnonymously()
      .catch((e) => {
        alert(e.message)
      })
  }
}
</script>

<style scoped>
#qrcode {
    position: absolute;
    bottom: 0;
    width: 100%;
    display: flex;
    justify-content: center;
}
</style>
