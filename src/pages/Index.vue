<template>
  <div class="row q-gutter">
    <Book
      v-for="id in ids"
      :id="id"
      :key="id"
    />
    <div
      class="fixed q-ma-xs"
      style="right: 0; bottom: 0"
    >
      <span v-if="user">
        <q-btn
          v-if="saved"
          class="q-ma-xs"
          round
          color="warning"
          @click="$q.localStorage.clear();update()"
        >
          <q-icon name="delete" />
        </q-btn>
        <q-btn
          class="q-ma-xs"
          round
          color="primary"
          @click="$refs.fileInput.click()"
        >
          <q-icon name="unarchive" />
        </q-btn>
        <q-btn
          class="q-ma-xs"
          round
          color="primary"
          @click="save"
        >
          <q-icon name="archive" />
        </q-btn>
        <q-btn
          class="q-ma-xs"
          round
          color="primary"
          @click="novo"
        >
          <q-icon name="add" />
        </q-btn>
      </span>
      <q-btn
        v-else
        class="q-ma-xs"
        round
        color="primary"
        @click="login"
      >
        <q-icon name="sync" />
      </q-btn>
    </div>
    <input
      id="open"
      ref="fileInput"
      type="file"
      style="display: none;"
      accept="application/json"
      @change="load"
    >
  </div>
</template>
<script>
import Book from 'components/Book'
import { uid, exportFile, date } from 'quasar'
const PREFIX = 'book_'
export default {
  name: 'PageIndex',
  components: {
    Book
  },
  data () {
    return {
      saved: false,
      ids: null,
      user: null,
      token: null
    }
  },
  created () {
    this.$auth().onAuthStateChanged((user) => {
      this.user = user
      if (user) {
        this.update()
        this.$q.notify('Logado como ' + user.email)
      }
    })
  },
  methods: {
    update () {
      this.saved = false
      this.ids = this.$q.localStorage.getAllKeys().filter((v) => {
        return v.startsWith(PREFIX)
      })
    },
    novo () {
      this.ids.push(PREFIX + uid())
    },
    save () {
      const books = {}
      for (const k of this.$q.localStorage.getAllKeys()) {
        if (k.startsWith(PREFIX)) {
          books[k] = this.$q.localStorage.getItem(k)
        }
      }
      const status = exportFile(PREFIX + date.formatDate(new Date(), 'YYYYMMDDHH') + '.json', JSON.stringify(books), 'application/json')
      if (status === true) {
        this.saved = true
      }
    },
    load (event) {
      const reader = new FileReader()
      reader.onload = (e) => {
        for (const [k, v] of Object.entries(JSON.parse(e.target.result))) {
          if (k.startsWith(PREFIX)) {
            this.$q.localStorage.set(k, v)
          }
        }
        this.update()
      }
      for (const file of event.target.files) {
        reader.readAsText(file)
      }
    },
    login () {
      if (this.user) {
        return
      }
      this.$auth().setPersistence(this.$auth.Auth.Persistence.LOCAL)
        .then(() => {
          const provider = new this.$auth.GoogleAuthProvider()
          this.$auth().signInWithPopup(provider)
            .catch((error) => {
              this.$q.notify(error.message)
            })
        })
        .catch((error) => {
          this.$q.notify(error.message)
        })
    }
  }
}
</script>
