import { prefixRoute } from "../configs";
import { LazyLoad } from "../components/LittleComponents";

export default [
    {
        tag: 'Route',
        name: '登录',
        path: prefixRoute + '/login',
        component: LazyLoad(() => import("../pages/login/Login")),
    },
    {
        tag: 'Redirect',
        from: '/',
        to: prefixRoute + '/auto_install_manage',
        exact: true,
    },
    {
        tag: 'Redirect',
        from: prefixRoute,
        to: prefixRoute + '/auto_install_manage',
        exact: true,
    },
    {
        tag: 'Route',
        name: '测试',
        path: prefixRoute + '/test',
        component: LazyLoad(() => import("../pages/test/Test2")),
    },
    {
        tag: 'Route',
        name: '主页',
        path: prefixRoute,
        component: LazyLoad(() => import("../pages/home/Home")),
        children: [
            {
                tag: 'Route',
                name: '磁盘故障列表',
                path: prefixRoute + '/disk_trouble_list',
                component: LazyLoad(() => import("../pages/diskTrouble/List/ListManage")),
            },
            {
                tag: 'Route',
                name: '磁盘修复历史',
                path: prefixRoute + '/disk_trouble_history',
                component: LazyLoad(() => import("../pages/diskTrouble/History/HistoryManage")),
            },
            {
                tag: 'Route',
                name: '装机管理',
                path: prefixRoute + '/auto_install_manage',
                component: LazyLoad(() => import("../pages/autoInstall/install/InstallManage"))
            },
            {
                tag: 'Route',
                name: '创建装机任务',
                path: prefixRoute + '/install_task_create',
                component: LazyLoad(() => import("../pages/autoInstall/install/TaskInfo"))
            },
            {
                tag: 'Route',
                name: '装机模板',
                path: prefixRoute + '/template_manage',
                component: LazyLoad(() => import("../pages/autoInstall/template/TemplateManage"))
            },
            {
                tag: 'Route',
                name: '创建装机模板',
                path: prefixRoute + '/install_template_create',
                component: LazyLoad(() => import("../pages/autoInstall/template/TemplateInfo"))
            },
            {
                tag: 'Route',
                name: '镜像管理',
                path: prefixRoute + '/mirror_manage',
                component: LazyLoad(() => import("../pages/autoInstall/mirror/MirrorManage"))
            },
            {
                tag: 'Route',
                name: '新增镜像',
                path: prefixRoute + '/mirror_create',
                component: LazyLoad(() => import("../pages/autoInstall/mirror/MirrorInfo"))
            },
            {
                tag: 'Route',
                name: 'ks文件管理',
                path: prefixRoute + '/fs_file_manage',
                component: LazyLoad(() => import("../pages/autoInstall/ksFiles/KSFileManage"))
            },
            {
                tag: 'Route',
                name: 'ks文件管理',
                path: prefixRoute + '/fs_file_create',
                component: LazyLoad(() => import("../pages/autoInstall/ksFiles/KsInfo"))
            },
            {
                tag: 'Route',
                name: 'DHCP文件管理',
                path: prefixRoute + '/dhcp_manage',
                component: LazyLoad(() => import("../pages/autoInstall/dhcp/DHCPManage"))
            },
            {
                tag: 'Route',
                name: 'yarn性能分析',
                path: prefixRoute + '/yarn/analysis',
                component: LazyLoad(() => import("../pages/yarn/YarnAnalysis"))
            },
            // {
            //     tag: 'Route',
            //     name: '系统管理',
            //     path: prefixRoute + '/system',
            //     component: DiskTrouble
            // },
            {
                tag: 'Route',
                path: prefixRoute + '/iframe',
                component: LazyLoad(() => import("../pages/Iframe"))
            },

        ]
    },

    {
        tag: 'Route',
        component: LazyLoad(() => import("../pages/NotFound"))
    },
];