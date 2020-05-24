<template>
  <div
    class="row q-gutter"
    style="max-width: 500px;"
  >
    <Book
      v-for="id in ids"
      :key="id"
      :id="id"
    />
    <q-btn
      round
      color="primary"
      @click="novo"
      class="fixed"
      style="right: 18px; bottom: 18px"
    >

      <q-icon name="add" />
    </q-btn>
  </div>
</template>
<script>
import Book from 'components/Book'
export default {
  name: 'PageIndex',
  components: {
    Book
  },
  created () {
    this.ids = this.$q.localStorage.getAllKeys().filter((v) => {
      if (v.startsWith('b_')) {
        const i = v.substring(2) | 0
        if (this.seq <= i) {
          this.seq = i
        }
        return true
      }
      return false
    })
  },
  data () {
    return {
      ids: null,
      seq: 1
    }
  },
  methods: {
    novo () {
      this.seq++
      this.ids.push('b_' + this.seq)
    }
  }
}
</script>
