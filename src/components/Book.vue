<template>
  <div
    class="q-pa-xs col-6"
    v-if="book"
  >
    <q-card
      class="mybook"
      :style="{ backgroundImage: `url('${this.cover}')` }"
    >
      <q-card-section
        class="row  fit justify-between"
        style="min-height: 45vh;background: rgba(255,255,255,0.6)"
      >
        <div
          class="full-width text-right"
          style="opacity: 0.8;"
        >
          <q-btn
            flat
            dense
            color="warning"
            @click="remove"
            v-if="book.edit"
            icon="delete"
          />
          <q-btn
            flat
            dense
            color="primary"
            @click="book.edit = !book.edit"
            :icon="book.edit?'turned_in_not':'turned_in'"
          />
        </div>
        <div class="full-width text-center">
          {{book.title||'New Title'}}
          <q-popup-edit
            v-if="book.edit"
            v-model="book"
            buttons
          >
            <q-select
              :value="book.title"
              @input="(v) => {book = df(v) }"
              use-input
              hide-selected
              fill-input
              :options="options"
              @filter="filterFn"
              hint="Buscar livros por titulo, autor ou assunto"
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
        <div class="full-width text-right">
          {{book.authors||'Autores'}}
          <q-popup-edit
            auto-save
            v-model="book.authors"
            v-if="book.edit"
          >
            <q-input
              v-model="book.authors"
              hint="Autores:"
              dense
              autofocus
            />
          </q-popup-edit>
        </div>
        <div
          v-if="book.publisher"
          class="full-width text-center"
        >
          <span>{{book.publisher}}</span>,
          <span>{{book.publishedDate}}</span>
        </div>
        <div class="full-width text-center">
          Meta
          <span>
            {{d2s(book.target)}}
            <q-popup-edit
              auto-save
              v-model="book.target"
            >
              <q-date
                v-model="book.target"
                flat
                minimal
                hint="Meta da leitura"
                autofocus
              />
            </q-popup-edit>
          </span>
        </div>
        <div class="full-width">
          <span>
            {{d2s(readDate)}}
            <q-popup-edit
              auto-save
              v-model="readDate"
            >
              <q-date
                v-model="readDate"
                flat
                minimal
                hint="Data da leitura"
                :options="past"
                :events="Object.keys(this.book.progress)"
              >
              </q-date>
            </q-popup-edit>
          </span> lido
          <span>
            {{readPages}}
            <q-popup-edit
              auto-save
              v-model="readPages"
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
              auto-save
              v-model="book.pageCount"
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
          <span>
            ({{rate}}%)
            <q-popup-edit
              auto-save
              :value="readPages"
            >
              <q-input
                type="number"
                :value="rate"
                @change="irate($event.target.value)"
                dense
                autofocus
                label="% lida"
              />
            </q-popup-edit>
          </span>
          <q-slider
            v-model="readPages"
            :min="0"
            :max="book.pageCount"
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<style lang="sass" scoped>
.mybook
  background-repeat: no-repeat
  background-position: center
  background-size: cover
</style>

<script>
import { date } from 'quasar'

export default {
  name: 'Book',
  props: { id: {} },
  data: function () {
    return {
      options: [],
      readDate: null,
      readPages: 0,
      book: null
    }
  },
  mounted () {
    if (this.$q.localStorage.has(this.id)) {
      this.book = this.df(this.$q.localStorage.getItem(this.id))
    } else {
      this.book = this.df({})
    }
    this.readDate = this.today()
  },
  computed: {
    cover () {
      return this.book.imageLinks.thumbnail
    },
    rate () {
      return Math.round(100 * this.readPages / this.book.pageCount)
    },
    readDates () {
      return Object.keys(this.book.progress)
    },
    getReadPages () {
      let r = 0, b = ''
      for (const [d, v] of Object.entries(this.book.progress)) {
        if ((b < d) && (d <= this.readDate)) {
          b = d
          r = v
        }
      }
      return r
    }
  },
  watch: {
    book: {
      handler () { this.save() },
      deep: true
    },
    readPages () {
      if (this.getReadPages < this.readPages) {
        this.book.progress[this.readDate] = this.readPages
      } else {
        delete this.book.progress[this.readDate]
      }
      this.save()
    },
    readDate () {
      this.readPages = this.getReadPages
    }
  },
  methods: {
    today () {
      const x = date.addToDate(new Date(), { hours: -12 })
      return date.formatDate(new Date(x.getFullYear(), x.getMonth(), x.getDate()), 'YYYY/MM/DD')
    },
    save () {
      if (this.book.title) {
        this.$q.localStorage.set(this.id, this.book)
      }
    },
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
        progress: {}
      }, v)
    },
    d2s (d) {
      return d ? date.formatDate(d, 'DD/MM') : '--/--'
    },
    past (d) {
      const dateFrom = date.addToDate(new Date(), { days: -60 })
      const dateTo = new Date()
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
