<template>
  <div
    class="q-pa-md col-6"
    v-if="book"
  >
    <q-card>
      <q-card-section>
        <div>
          {{book.title||'New Title'}}
          <q-popup-edit
            v-model="book.title"
            buttons
            v-if="book.edit"
          >
            <q-select
              :value="book.title"
              @input="(v) => {book = df(v) }"
              use-input
              hide-selected
              fill-input
              :options="options"
              @filter="filterFn"
              hint="burcar livros por titulo, autor e assunto"
              autofocus
            >
              <template v-slot:option="scope">
                <q-item
                  v-bind="scope.itemProps"
                  v-on="scope.itemEvents"
                >
                  <q-item-section
                    avatar
                    v-if="scope.opt.imageLinks"
                  >
                    <q-img :src="scope.opt.imageLinks.smallThumbnail" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label v-html="scope.opt.title" />
                    <q-item-label caption>
                      <span> {{scope.opt.authors}} </span>
                      <span>, {{scope.opt.publisher}} </span>
                      <span>, {{scope.opt.publishedDate}} </span>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-popup-edit>
        </div>
        <div class="text-right">
          {{book.authors||'Autores'}}
          <q-popup-edit
            v-model="book.authors"
            buttons
            v-if="book.edit"
          >
            <q-input
              v-model="book.authors"
              hint="autor"
              dense
              autofocus
            />
          </q-popup-edit>
        </div>
        <div v-if="book.publisher">
          <span>{{book.publisher}}</span>, <span>{{book.publishedDate}}</span>
        </div>
        <div>
          Meta
          <span>
            {{d2s(book.target)}}
            <q-popup-edit
              v-model="book.target"
              buttons
            >
              <q-date
                v-model="book.target"
                minimal
              />
            </q-popup-edit>
          </span>
        </div>
        <div class="text-subtitle">
          Em
          <span>
            {{d2s(book.readDate)}}
            <q-popup-edit
              v-model="book.readDate"
              buttons
            >
              <q-date
                v-model="book.readDate"
                hint="Ultima data lida"
                :options="past"
                minimal
              />
            </q-popup-edit>
          </span>lido
        </div>
        <div class="text-subtitle">
          <span>
            {{readPages}}
            <q-popup-edit
              v-model="readPages"
              buttons
            >
              <q-input
                type="number"
                v-model.number="readPages"
                dense
                autofocus
                label="Páginas lidas"
              />
            </q-popup-edit>
          </span>
          de
          <span>
            {{book.pageCount}}
            <q-popup-edit
              v-model="book.pageCount"
              buttons
              v-if="book.edit"
            >
              <q-input
                type="number"
                v-model.number="book.pageCount"
                dense
                autofocus
                label="Páginas do livro"
              />
            </q-popup-edit>
          </span>
          (
          <span>
            {{rate}}
            <q-popup-edit
              :value="book.readPages"
              buttons
            >
              <q-input
                type="number"
                :value="book.rate"
                @change="irate($event.target.value)"
                dense
                autofocus
                label="% lida"
              />
            </q-popup-edit>
          </span>
          % )
          <q-slider
            v-model="book.readPages"
            :min="0"
            :max="book.pageCount"
          />
        </div>
      </q-card-section>
      <div class="absolute-top-right">
        <q-btn
          flat
          round
          color="warning"
          @click="remove"
          v-if="book.edit"
          icon="delete"
        />
        <q-btn
          flat
          round
          color="primary"
          @click="book.edit = !book.edit"
          :icon="book.edit?'turned_in_not':'turned_in'"
        />
      </div>
    </q-card>
  </div>
</template>

<style lang="sass" scoped>
.my-card
  height: 50vh
</style>

<script>
import { date } from 'quasar'

export default {
  name: 'Book',
  props: { id: {} },
  data: function () {
    return {
      options: [],
      book: null
    }
  },
  mounted () {
    if (this.$q.localStorage.has(this.id)) {
      this.book = this.df(this.$q.localStorage.getItem(this.id))
    } else {
      this.book = this.df({})
    }
  },
  computed: {
    rate () {
      return Math.round(100 * this.book.readPages / this.book.pageCount)
    },
    readPages: {
      get () {
        return this.book.progress.reduce(
          (a, b) => { return a > b ? a : b },
          0)
      },
      set (v) {

      }
    }
  },
  watch: {
    book: {
      handler (val) {
        if (this.book.title) {
          this.$q.localStorage.set(this.id, this.book)
        }
      },
      deep: true
    }
  },
  methods: {
    remove () {
      this.$q.localStorage.remove(this.id)
      this.book = null
      this.$emit('deleted')
    },
    df (v) {
      return Object.assign({
        edit: true,
        title: null,
        authors: null,
        imageLinks: {
          thumbnail: 'https://picsum.photos/200/300'
        },
        pageCount: 302,
        readPages: 0,
        readDate: null,
        target: null,
        progress: []
      }, v)
    },
    d2s (d) {
      return d ? date.formatDate(d, 'DD/MM') : '--/--'
    },
    past (d) {
      const dateFrom = date.addToDate(new Date(), { days: -60 })
      const dateTo = date.addToDate(new Date(), { days: 1 })
      return date.isBetweenDates(d, dateFrom, dateTo)
    },
    irate (v) {
      this.book.readPages = Math.round(v * this.book.pageCount / 100) || this.book.readPages
    },
    selectFn (opt) {
      this.book = opt
    },
    cache (x, update) {
      update(() => {
        this.options = this.$q.localStorage.getItem(x).items.map((i) => {
          i.volumeInfo.authors = i.volumeInfo.authors ? i.volumeInfo.authors.join(', ') : null
          return i.volumeInfo
        })
      })
    },
    filterFn (val, update, abort) {
      const x = 's_' + val
      if (val.length < 4) {
        abort()
      } else if (this.$q.localStorage.has(x)) {
        this.cache(x, update)
      } else {
        this.$axios.get('https://www.googleapis.com/books/v1/volumes', { params: { q: val, printType: 'books', maxResults: 40 } })
          .then(response => {
            this.$q.localStorage.set(x, response.data)
            this.cache(x, update)
          })
      }
    }
  }
}
</script>
