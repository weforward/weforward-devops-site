const state = {
    getChart: false,
    getTable: false,
    service_name: '',
    service_no: '',
    method_name: '',
    time_type: 0,
    search_time_type: []
}

const mutations = {
    CHANGE_GTECHART: (state, bool = false) => {
        state.getChart = bool
    },
    CHANGE_GETTABLE: (state, bool = false) => {
        state.getTable = bool
    },
    SET_PARAMS: (state, {key, value}) => {
        state[key] = value
    }
}

export default {
    state,
    mutations
}
