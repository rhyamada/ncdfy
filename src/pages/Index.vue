<template>
  <div
    class="row q-gutter"
    style="max-width: 500px;"
  >
    <Book
      v-for="id in ids"
      :id="id"
      :key="id"
    />
    <a
      href="data:application/json,teste"
      download="books.json"
    >data</a>
    <div
      class="fixed q-ma-xs"
      style="right: 0; bottom: 0"
    >
      <q-btn
        class="q-ma-xs"
        round
        color="primary"
        @click="open"
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
  </div>
</template>
<script>
import Book from 'components/Book'
import { uid } from 'quasar'
export default {
  name: 'PageIndex',
  components: {
    Book
  },
  data () {
    return {
      ids: null
    }
  },
  created () {
    this.ids = this.$q.localStorage.getAllKeys().filter((v) => {
      return v.startsWith('b_')
    })
  },
  methods: {
    save () {

    },
    novo () {
      this.ids.push('b_' + uid())
    }
  }
}
</script>
