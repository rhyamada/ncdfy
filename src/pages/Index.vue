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
export default {
  name: 'PageIndex',
  components: {
    Book
  },
  data () {
    return {
      saved: false,
      ids: null
    }
  },
  created () {
    this.update()
  },
  methods: {
    update () {
      this.saved = false
      this.ids = this.$q.localStorage.getAllKeys().filter((v) => {
        return v.startsWith('book_')
      })
    },
    novo () {
      this.ids.push('book_' + uid())
    },
    save () {
      const books = {}
      for (const k of this.$q.localStorage.getAllKeys()) {
        if (k.startsWith('book_')) {
          books[k] = this.$q.localStorage.getItem(k)
        }
      }
      const status = exportFile('books_' + date.formatDate(new Date(), 'YYYYMMDD') + '.json', JSON.stringify(books), 'application/json')
      if (status === true) {
        this.saved = true
      }
    },
    load (event) {
      const reader = new FileReader()
      reader.onload = (e) => {
        for (const [k, v] of Object.entries(JSON.parse(e.target.result))) {
          if (k.startsWith('book_')) {
            this.$q.localStorage.set(k, v)
          }
        }
        this.update()
      }
      for (const file of event.target.files) {
        reader.readAsText(file)
      }
    }
  }
}
</script>
