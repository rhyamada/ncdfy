/* eslint-disable vue/no-v-html */
<template>
  <div
    v-if="book"
    class="q-pa-md"
  >
    <q-card
      class="mybook"
      :style="{ backgroundImage: `url('${book.cover}')` }"
    >
      <q-card-section
        class="row fit items-center q-pa-xs justify-between text-center text-h6"
        style="min-height: 140vw; background: rgba(255,255,244,0.5)"
      >
        <div
          class="absolute-top-right"
          style="transform: translateY(-25%);"
        >
          <q-btn
            v-if="book.edit"
            flat
            size="2rem"
            color="warning"
            icon="delete"
            @click="remove"
          />
          <q-btn
            color="primary"
            size="2rem"
            flat
            :icon="book.edit?'turned_in_not':'turned_in'"
            @click="book.edit = !book.edit"
          />
        </div>
        <div class="full-width text-h4">
          {{ book.title||'Buscar livros...' }}
          <q-popup-edit
            v-if="book.edit"
            v-model="book"
          >
            <q-select
              :value="book.title"
              use-input
              hide-selected
              fill-input
              :options="options"
              hint="Buscar livros por titulo, autor ou assunto"
              autofocus
              @input="(v) => {book = df(v) }"
              @filter="filterFn"
            >
              <template v-slot:option="scope">
                <q-item
                  v-bind="scope.itemProps"
                  v-on="scope.itemEvents"
                >
                  <q-item-section
                    v-if="scope.opt.thumbnail"
                    avatar
                  >
                    <q-img :src="scope.opt.thumbnail" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>
                      {{ scope.opt.title }}
                    </q-item-label>
                    <q-item-label caption>
                      <span>{{ scope.opt.authors }}</span>
                      <span>, {{ scope.opt.publisher }}</span>
                      <span>, {{ scope.opt.publishedDate }}</span>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-popup-edit>
        </div>
        <div class="full-width text-right">
          {{ book.authors||'Autores' }}
          <q-popup-edit
            v-if="book.edit"
            v-model="book.authors"
          >
            <q-input
              v-model="book.authors"
              hint="Autores"
            />
          </q-popup-edit>
        </div>
        <div
          v-if="book.publisher || book.publishedDate"
          class="full-width"
        >
          {{ book.publisher }}, {{ book.publishedDate }}
        </div>
        <div class="full-width">
          Meta {{ d2s(book.target) }}<q-popup-edit v-model="book.target">
            <q-date
              v-model="book.target"
              :events="Object.keys(book.progress)"
            />
          </q-popup-edit>
        </div>
        <div
          v-if="objetivo"
          class="full-width"
        >
          Objetivo {{ objetivo }} ({{ Math.round(objetivo*100/book.pageCount) }}%)
        </div>
        <div class="full-width">
          <span>
            {{ readPages }}
            <q-popup-edit v-model="readPages">
              <q-input
                v-model.number="readPages"
                type="number"
                :hint="'Páginas lidas em '+d2s(readDate)"
              />
            </q-popup-edit>
          </span>de<span>
            {{ book.pageCount }}
            <q-popup-edit
              v-if="book.edit"
              v-model="book.pageCount"
            >
              <q-input
                v-model.number="book.pageCount"
                type="number"
                hint="Número de páginas no livro"
              />
            </q-popup-edit>
          </span>
          <span>
            ({{ rate }}%)
            <q-popup-edit :value="readPages">
              <q-input
                :value="rate"
                type="number"
                :hint="'% lida em '+d2s(readDate)"
                @change="irate($event.target.value)"
              />
            </q-popup-edit>
          </span>
        </div>
        <div class="full-width">
          lidos em {{ d2s(readDate) }}
          <q-popup-edit v-model="readDate">
            <q-date
              v-model="readDate"
              :options="past"
              :events="Object.keys(book.progress)"
            />
          </q-popup-edit>
        </div>
        <div class="full-width">
          <q-slider
            v-model="readPages"
            :min="0"
            :max="book.pageCount"
            dense
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
import { date, QPopupEdit, QInput, QDate } from 'quasar'

QPopupEdit.options.props.contentClass = { default: 'q-pa-xs' }
QPopupEdit.options.props.autoSave = { type: Boolean, default: true }
QPopupEdit.options.props.buttons = { type: Boolean, default: true }
QPopupEdit.options.props.labelSet = { type: String, default: 'Salvar' }
QPopupEdit.options.props.labelCancel = { type: String, default: 'Cancelar' }
QDate.options.props.minimal = { type: Boolean, default: true }
QInput.options.props.autofocus = { type: Boolean, default: true }

export default {
  name: 'Book',
  props: { id: { type: String, default: null } },
  data: function () {
    return {
      options: [],
      readDate: this.today(),
      book: null
    }
  },
  computed: {
    rate () {
      return Math.round(100 * this.readPages / this.book.pageCount)
    },
    objetivo () {
      if (this.book.target) {
        const t = this.today()
        const s = date.getDateDiff(this.book.target, t, 'days') + 1
        if (s > 0) {
          const r = this.scan(this.book.progress, t, false)
          return Math.round(r + (this.book.pageCount - r) / s)
        }
      }
      return null
    },
    readPages: {
      get: function () {
        return this.scan(this.book.progress, this.readDate, true)
      },
      set: function (v) {
        if (v > this.scan(this.book.progress, this.readDate, false)) {
          this.$set(this.book.progress, this.readDate, v)
        } else {
          this.$delete(this.book.progress, this.readDate)
        }
      }
    },
    readDates () {
      return Object.keys(this.book.progress)
    }
  },
  watch: {
    book: {
      handler () {
        if (this.book && this.book.title) {
          this.$q.localStorage.set(this.id, this.book)
        }
      },
      deep: true
    }
  },
  mounted () {
    this.book = this.df(this.$q.localStorage.getItem(this.id) || {})
  },
  methods: {
    scan (progress, limit, include = false) {
      let r = 0, b = ''
      for (const [d, v] of Object.entries(progress)) {
        if ((b < d) && ((d < limit) || (include && (d === limit)))) {
          b = d
          r = v
        }
      }
      return r
    },
    today () {
      const x = date.addToDate(new Date(), { hours: -12 })
      return date.formatDate(new Date(x.getFullYear(), x.getMonth(), x.getDate()), 'YYYY/MM/DD')
    },
    remove () {
      this.$q.localStorage.remove(this.id)
      this.book = null
      this.$emit('deleted')
    },
    df (v) {
      const t = {
        edit: true,
        title: null,
        authors: null,
        cover: 'https://picsum.photos/200/300',
        pageCount: 300,
        target: null,
        progress: {}
      }
      return Object.assign(t, v)
    },
    d2s (d) {
      return d ? date.formatDate(d, 'DD/MM') : '--/--'
    },
    past (d) {
      if (this.readDates.includes(d)) {
        return true
      }
      return date.isBetweenDates(d, date.getMaxDate(...this.readDates), this.today(), { inclusiveTo: true })
    },
    irate (v) {
      const n = Math.round(v * this.book.pageCount / 100) || this.readPages
      console.log(n)
      this.readPages = n
    },
    cache (x, update) {
      update(() => {
        this.options = this.$q.localStorage.getItem(x).items.map((i) => {
          return Object.assign(i.volumeInfo, {
            cover: i.volumeInfo.imageLinks ? i.volumeInfo.imageLinks.thumbnail.replace('http://', 'https://') : null,
            thumbnail: i.volumeInfo.imageLinks ? i.volumeInfo.imageLinks.smallThumbnail.replace('http://', 'https://') : null,
            authors: i.volumeInfo.authors ? i.volumeInfo.authors.join(', ') : null,
            publishedDate: i.volumeInfo.publishedDate ? i.volumeInfo.publishedDate.substring(0, 4) : null
          })
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
