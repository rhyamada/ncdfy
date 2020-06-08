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
          style="opacity: 0.7;transform: translateY(-25%);"
        >
          <q-btn
            v-if="book.edit"
            flat
            size="2rem"
            color="warning"
            icon="delete_outline"
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
          <span :class="book.edit?'edit':''">{{ book.title||'Buscar livros...' }}</span>
          <q-popup-edit
            v-if="book.edit"
            v-model="book"
          >
            <q-select
              :value="book.title"
              use-input
              hide-selected
              new-value-mode="add-unique"
              fill-input
              :options="options"
              hint="Buscar livros por titulo, autor ou assunto"
              autofocus
              @input="selectFn"
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
          <span :class="book.edit?'edit':''">{{ book.authors||'Autores' }}</span>
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
          class="full-width text-caption"
        >
          {{ book.publisher }}, {{ book.publishedDate }}
        </div>
        <div class="full-width">
          Meta
          <span class="edit">
            {{ d2s(book.target) }}<q-popup-edit v-model="book.target">
              <q-date
                v-model="book.target"
                :events="Object.keys(book.progress)"
              />
            </q-popup-edit>
          </span>
          <span
            v-if="previsao"
            class="text-caption"
          >,
            (prev. {{ previsao }})
          </span>
        </div>
        <div
          v-if="objetivo"
          class="full-width"
        >
          Objetivo {{ objetivo }} ( {{ Math.round(100*objetivo/book.pageCount) }}% )
          <q-btn
            dense
            color="primary"
            flat
            :icon="check?'check_box':'check_box_outline_blank'"
            @click="check=!check"
          />
        </div>
        <div class="full-width">
          Lidos
          <span class="edit">
            {{ readPages }}<q-popup-edit v-model="readPages">
              <q-input
                v-model.number="readPages"
                type="number"
                :hint="'Páginas lidas em '+d2s(readDate)"
              />
            </q-popup-edit>
          </span> de
          <span :class="book.edit?'edit':''">
            {{ book.pageCount }}<q-popup-edit
              v-if="book.edit"
              v-model="book.pageCount"
            >
              <q-input
                v-model.number="book.pageCount"
                type="number"
                hint="Número de páginas no livro"
              />
            </q-popup-edit>
          </span> (<span class="edit">
            {{ rate }}%
            <q-popup-edit :value="readPages">
              <q-input
                :value="rate"
                type="number"
                :hint="'% lida em '+d2s(readDate)"
                @change="irate($event.target.value)"
              />
            </q-popup-edit>
          </span>)
          em
          <span class="edit">
            {{ d2s(readDate) }}<q-popup-edit v-model="readDate">
              <q-date
                v-model="readDate"
                :options="past"
                :events="Object.keys(book.progress)"
              />
            </q-popup-edit>
          </span>
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
.edit
  border-bottom: 1px dotted gray
  margin-bottom: -1px
  &::after
    content: '✏️'
    position: absolute
    font-size: 0.4em
    transform: translateY(1em)
</style>

<script>
import { date, debounce, QPopupEdit, QInput, QDate } from 'quasar'
require('assets/nocover.gif')
QPopupEdit.options.props.contentClass = { default: 'q-pa-xs' }
QPopupEdit.options.props.autoSave = { type: Boolean, default: true }
QPopupEdit.options.props.buttons = { type: Boolean, default: true }
QPopupEdit.options.props.labelSet = { type: String, default: 'Salvar' }
QPopupEdit.options.props.labelCancel = { type: String, default: 'Cancelar' }
QDate.options.props.minimal = { type: Boolean, default: true }
QDate.options.props.flat = { type: Boolean, default: true }
QInput.options.props.autofocus = { type: Boolean, default: true }

export default {
  name: 'Book',
  props: { id: { type: String, default: null } },
  data: function () {
    return {
      options: [],
      readDate: null,
      book: null
    }
  },
  computed: {
    rate () {
      return Math.round(100 * this.readPages / this.book.pageCount)
    },
    previsao () {
      const t = this.today()
      const r = this.scan(this.book.progress, t, true)
      if (r && r < this.book.pageCount) {
        const days = Math.round((this.book.pageCount - r) * this.readDates.length / r)
        return this.d2s(date.addToDate(t, { days: days }))
      }
      return null
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
    },
    check: {
      get: function () {
        return this.scan(this.book.progress, this.today(), true) >= this.objetivo
      },
      set: function (v) {
        this.readDate = this.today()
        this.readPages = v ? this.objetivo : 0
      }
    }
  },
  watch: {
    book: {
      handler () {
        debounce(this.save, 1000)()
      },
      deep: true
    }
  },
  mounted () {
    const book = this.$q.localStorage.getItem(this.id)
    this.book = this.df(book || {})
    const t = this.today()
    if (this.scan(this.book.progress, t) >= this.book.pageCount) {
      this.readDate = date.getMaxDate(...this.readDates)
    } else {
      this.readDate = t
    }
  },
  methods: {
    save () {
      if (this.book && this.book.title) {
        this.$q.localStorage.set(this.id, this.book)
      }
    },
    remove () {
      this.$q.localStorage.remove(this.id)
      this.book = null
    },
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
      return date.formatDate(date.addToDate(new Date(), { hours: -12 }), 'YYYY/MM/DD')
    },
    df (v) {
      const t = {
        edit: true,
        title: null,
        authors: null,
        cover: 'https://books.google.com.br/googlebooks/images/no_cover_thumb.gif',
        pageCount: 300,
        target: null,
        progress: {}
      }
      if (typeof v !== 'object') {
        v = { title: v }
      }
      return Object.assign(t, v)
    },
    d2s (d) {
      return d ? date.formatDate(d, 'DD/MM') : '--/--'
    },
    past (d) {
      return this.readDates.includes(d) || date.isBetweenDates(d, date.getMaxDate(...this.readDates), this.today(), { inclusiveTo: true })
    },
    irate (v) {
      const n = Math.round(v * this.book.pageCount / 100) || this.readPages
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
    selectFn (value) {
      this.book = this.df(value)
    },
    filterFn (val, update, abort) {
      const x = 's_' + val
      if (val.length < 4) {
        abort()
      } else if (this.$q.localStorage.has(x)) {
        this.cache(x, update)
      } else {
        this.$axios.get('https://www.googleapis.com/books/v1/volumes', { params: { q: val, printType: 'books', maxResults: 20 } })
          .then(response => {
            this.$q.localStorage.set(x, response.data)
            this.cache(x, update)
          })
      }
    }
  }
}
</script>
