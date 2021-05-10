<script>
import useIndexedDB from './features/useIndexedDB'

export default {
  name: 'App',
  setup() {
    const { getDatabase, getTodos, saveTodo } = useIndexedDB

    return {
      getDatabase,
      getTodos,
      saveTodo
    }
  },
  // app initial state
  data: () => ({
    todoDatabase: null,
    todos: [],
    newTodo: '',
    editedTodo: null,
    visibility: 'all'
  }),

  // watch todos change for localStorage persistence
  // watch: {
  //   todos: {
  //     deep: true,
  //     handler() {
  //       console.log('hello')
  //     }
  //   }
  // },

  // computed properties
  // http://vuejs.org/guide/computed.html
  computed: {
    activeTasks() {
      return this.todos.filter(function(todo) {
        return !todo.completed
      })
    },
    completed: function() {
      return this.todos.filter(function(todo) {
        return todo.completed
      })
    },
    filteredTodos: function() {
      return this.todos.filter(todo => !todo.completed)
    },
    remaining: function() {
      // return filters.active(this.todos).length
      return this.activeTasks.length
    },
    allDone: {
      get: function() {
        return this.remaining === 0
      },
      set: function(value) {
        this.todos.forEach(function(todo) {
          todo.completed = value
        })
      }
    }
  },

  // methods that implement data logic.
  // note there's no DOM manipulation here at all.
  methods: {
    pluralize: function(word, count) {
      return word + (count === 1 ? '' : 's')
    },

    async addTodo() {
      const value = this.newTodo && this.newTodo.trim()
      const todoItem = {
        id: this.todos.length + 1,
        title: value,
        completed: false
      }

      if (!value) {
        return
      }
      this.todos.push(todoItem)
      await this.saveTodo(todoItem, this.todoDatabase)
      this.newTodo = ''
    },

    removeTodo: function(todo) {
      var index = this.todos.indexOf(todo)
      this.todos.splice(index, 1)
    },

    editTodo: function(todo) {
      this.beforeEditCache = todo.title
      this.editedTodo = todo
    },

    doneEdit: function(todo) {
      if (!this.editedTodo) {
        return
      }
      this.editedTodo = null
      todo.title = todo.title.trim()
      if (!todo.title) {
        this.removeTodo(todo)
      }
    },

    cancelEdit: function(todo) {
      this.editedTodo = null
      todo.title = this.beforeEditCache
    },

    removeCompleted: function() {
      this.todos = [] // filters.active(this.todos)
    }
  },

  async created() {
    this.todoDatabase = await this.getDatabase()
    this.todos = await this.getTodos(this.todoDatabase)
  }

  // a custom directive to wait for the DOM to be updated
  // before focusing on the input field.
  // http://vuejs.org/guide/custom-directive.html
  // directives: {
  //   'todo-focus': function(el, binding) {
  //     if (binding.value) {
  //       el.focus()
  //     }
  //   }
  // }
}
</script>

<template>
  <section class="todoapp">
    <header class="header">
      <h1>todos</h1>
      <input
        class="new-todo"
        autofocus
        autocomplete="off"
        placeholder="What needs to be done?"
        v-model="newTodo"
        @keyup.enter="addTodo"
      />
    </header>
    <section class="main" v-show="todos.length">
      <input
        id="toggle-all"
        class="toggle-all"
        type="checkbox"
        v-model="allDone"
      />
      <label for="toggle-all">Mark all as complete</label>
      <ul class="todo-list">
        <li
          class="todo"
          v-for="todo in filteredTodos"
          :key="todo.id"
          :class="{ completed: todo.completed, editing: todo == editedTodo }"
        >
          <div class="view">
            <input class="toggle" type="checkbox" v-model="todo.completed" />
            <label @dblclick="editTodo(todo)">{{ todo.title }}</label>
            <button class="destroy" @click="removeTodo(todo)"></button>
          </div>
          <input
            class="edit"
            type="text"
            v-model="todo.title"
            @blur="doneEdit(todo)"
            @keyup.enter="doneEdit(todo)"
            @keyup.esc="cancelEdit(todo)"
          />
        </li>
      </ul>
    </section>
    <footer class="footer" v-show="todos.length">
      <span class="todo-count">
        <strong v-text="remaining"></strong>
        {{ pluralize('item', remaining) }} left
      </span>
      <ul class="filters">
        <li>
          <a href="#/all" :class="{ selected: visibility == 'all' }">All</a>
        </li>
        <li>
          <a href="#/active" :class="{ selected: visibility == 'active' }"
            >Active</a
          >
        </li>
        <li>
          <a href="#/completed" :class="{ selected: visibility == 'completed' }"
            >Completed</a
          >
        </li>
      </ul>
      <button
        class="clear-completed"
        @click="removeCompleted"
        v-show="todos.length > remaining"
      >
        Clear completed
      </button>
    </footer>
  </section>
  <footer class="info">
    <p>Double-click to edit a todo</p>
    <p>
      An iteration on
      <a href="https://todomvc.com/examples/vue/">TodoMVC - Vue</a>
    </p>
  </footer>
</template>

<style>
@import './styles/todomvc-base.css';
@import './styles/todomvc-index.css';

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
