import Vue from 'vue'
import 'element-ui/lib/theme-chalk/index.css';
import {
    Button,
    DatePicker,
    Form,
    FormItem,
    Input,
    Option,
    Pagination,
    Select,
    Table,
    TableColumn,
    Tag,
    Empty,
    Message,
    Dialog,
    Tree,
    Loading
} from 'element-ui'

Vue.use(Button)
Vue.use(Select)
Vue.use(Input)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Option)
Vue.use(Tag)
Vue.use(DatePicker)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Pagination)
Vue.use(Empty)
Vue.use(Dialog)
Vue.use(Tree)
Vue.use(Loading)

Vue.prototype.$message = Message;
