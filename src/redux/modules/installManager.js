const initState = {
    activeTab: 'tab1',
};

const types = {
    CHANGE_ACTIVE_TAB: 'CHANGE_ACTIVE_TAB'
};

export const actions = {
    changeActiveTab: (value) => ({
        type: types.CHANGE_ACTIVE_TAB,
        value: value,
    })
};

const reducer = (state = initState, action) => {
    switch (action.type) {
        case types.CHANGE_ACTIVE_TAB:
            return { ...state, activeTab: action.value };
        default:
            return state;
    }
};

export default reducer;