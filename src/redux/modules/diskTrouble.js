import { bindActionCreators } from "redux";
import { connect } from "react-redux";

const initState = {
    activeTopTab: 'tab1',
    activeLeftTab: 'tab1',

    unInstallList: [], // 卸载列表
    taskId: undefined, // 任务ID
    isExpendContent: false, // 是否需要扩展 drag-content
    websocketMsg: undefined,
    stepStatus: [], // 步骤状态
    stepCurrent: 0,//步骤数
};

const types = {
    CHANGE_TOP_TAB: 'CHANGE_TOP_TAB',
    CHANGE_LEFT_TAB: 'CHANGE_LEFT_TAB',
    CHANGE_UNINSTALL_LIST: ' CHANGE_UNINSTALL_LIST',
    CHANGE_TASK_ID: ' CHANGE_TASK_ID',
    CHANGE_IS_EXPEND_CONTENT: 'CHANGE_IS_EXPEND_CONTENT',
    WEBSOCKET_MSG: 'WEBSOCKET_MSG',
    STEP_STATUS: 'STEP_STATUS',
    STEP_CURRENT: 'STEP_CURRENT',
};

const actions = {
    changeTopTab: (value) => ({
        type: types.CHANGE_TOP_TAB,
        value: value,
    }),
    changeLeftTab: (value) => ({
        type: types.CHANGE_LEFT_TAB,
        value: value,
    }),
    changeUninstallList: (value) => ({
        type: types.CHANGE_UNINSTALL_LIST,
        value: value,
    }),
    changeTaskId: (value) => ({
        type: types.CHANGE_TASK_ID,
        value: value
    }),
    changeIsExpendContent: (value) => ({
        type: types.CHANGE_IS_EXPEND_CONTENT,
        value: value
    }),
    setWebsocketMsg: (value) => ({
        type: types.WEBSOCKET_MSG,
        value: value
    }),
    changeStepStatus: (value) => ({
        type: types.STEP_STATUS,
        value: value
    }),
    changeStepCurrent: (value) => ({
        type: types.STEP_CURRENT,
        value: value
    }),
};

const reducer = (state = initState, actions) => {
    switch (actions.type) {
        case types.CHANGE_TOP_TAB:
            return { ...state, activeTopTab: actions.value };
        case types.CHANGE_LEFT_TAB:
            return { ...state, activeLeftTab: actions.value };
        case types.CHANGE_UNINSTALL_LIST:
            return { ...state, unInstallList: actions.value };
        case types.CHANGE_TASK_ID:
            return { ...state, taskId: actions.value };
        case types.CHANGE_IS_EXPEND_CONTENT:
            return { ...state, isExpendContent: actions.value };
        case types.WEBSOCKET_MSG:
            return { ...state, websocketMsg: actions.value };
        case types.STEP_STATUS:
            return { ...state, stepStatus: actions.value };
        case types.STEP_CURRENT:
            return { ...state, stepCurrent: actions.value };

        default:
            return state;
    }
};

export default reducer;

export const reduxMapper = (C) => {
    const mapStateToProps = (state) => ({
        activeTopTab: state.diskTrouble.activeTopTab,
        activeLeftTab: state.diskTrouble.activeLeftTab,
        unInstallList: state.diskTrouble.unInstallList,
        taskId: state.diskTrouble.taskId,
        isExpendContent: state.diskTrouble.isExpendContent,
        websocketMsg: state.diskTrouble.websocketMsg,
        stepStatus: state.diskTrouble.stepStatus,
        stepCurrent: state.diskTrouble.stepCurrent,
    });

    const mapDispatchToProps = (dispatch) => ({
        ...bindActionCreators(actions, dispatch)
    });

    return connect(mapStateToProps, mapDispatchToProps)(C);
};