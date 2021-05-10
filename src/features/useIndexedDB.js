const DATABASE_NAME = 'todomvcdb'
const DATABASE_VERSION = 1
const ITEM_NAME = 'todos'
let database

export default {
  async getDatabase() {
    return new Promise((resolve, reject) => {
      if (database) {
        return resolve(database)
      }
      console.log('STATUS: Opening database', database)
      let request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION)

      request.onerror = event => {
        console.error('ERROR: Unable to open database', event)
        reject('Error')
      }

      request.onsuccess = e => {
        database = e.target.result
        resolve(database)
      }

      request.onupgradeneeded = e => {
        console.log('onupgradeneeded')
        let database = e.target.result
        database.createObjectStore(ITEM_NAME, {
          autoIncrement: true,
          keyPath: 'id'
        })
      }
    })
  },

  async deleteTodo(todo, db) {
    return new Promise(resolve => {
      let trans = db.transaction([ITEM_NAME], 'readwrite')
      trans.oncomplete = () => {
        resolve()
      }

      let store = trans.objectStore(ITEM_NAME)
      store.delete(todo.id)
    })
  },

  async getTodos(db) {
    return new Promise(resolve => {
      let trans = db.transaction([ITEM_NAME], 'readonly')
      trans.oncomplete = () => {
        resolve(todos)
      }

      let store = trans.objectStore(ITEM_NAME)
      let todos = []

      store.openCursor().onsuccess = e => {
        let cursor = e.target.result
        if (cursor) {
          todos.push(cursor.value)
          cursor.continue()
        }
      }
    })
  },

  async saveTodo(todo, db) {
    return new Promise(resolve => {
      let trans = db.transaction([ITEM_NAME], 'readwrite')
      trans.oncomplete = () => {
        resolve()
      }

      let store = trans.objectStore(ITEM_NAME)
      store.put(todo)
    })
  }
}
