import { prefixRoute } from '../configs';

export default [
    // {
    //     name: '集群重要监控',
    //     url: '',
    //     icon: 'tag',
    //     openWay: 'Replace_Tab',
    //     children: [
    //         {
    //             name: '物理硬件',
    //             url: '',
    //             icon: '',
    //             openWay: 'Replace_Tab',
    //         },
    //         {
    //             name: '虚拟主机与虚拟机',
    //             url: '',
    //             icon: '',
    //             openWay: 'Replace_Tab',
    //         },
    //         {
    //             name: '软件',
    //             url: '',
    //             icon: '',
    //             openWay: 'Replace_Tab',
    //         },
    //         {
    //             name: '基础设施',
    //             url: '',
    //             icon: '',
    //             openWay: 'Replace_Tab',
    //         },
    //     ]
    // },
    {
        name: '自动化装机',
        url: '',
        icon: 'tool',
        openWay: 'Replace_Tab',
        children: [
            {
                name: '装机管理',
                url: prefixRoute + '/auto_install_manage',
                icon: '',
                openWay: 'Replace_Tab',
            },
            {
                name: '模板管理',
                url: prefixRoute + '/template_manage',
                icon: '',
                openWay: 'Replace_Tab',
            },
            {
                name: '镜像管理',
                url: prefixRoute + '/mirror_manage',
                icon: '',
                openWay: 'Replace_Tab',
            },
            {
                name: 'ks文件管理',
                url: prefixRoute + '/fs_file_manage',
                icon: '',
                openWay: 'Replace_Tab',
            },
            {
                name: 'DHCP文件管理',
                url: prefixRoute + '/dhcp_manage',
                icon: '',
                openWay: 'Replace_Tab',
            },
        ]
    },
    {
        name: '磁盘故障修复',
        url: '',
        icon: 'picture',
        openWay: 'Replace_Tab',
        children: [
            {
                name: '磁盘故障列表',
                url: prefixRoute + '/disk_trouble_list',
                icon: '',
                openWay: 'Replace_Tab',
            },
            {
                name: '磁盘修复历史',
                url: prefixRoute + '/disk_trouble_history',
                icon: '',
                openWay: 'Replace_Tab',
            },
        ]
    },
    {
        name: 'yarn性能分析',
        url: prefixRoute + '/yarn/analysis',
        icon: 'bar-chart',
        openWay: 'Replace_Tab',
    },
    {
        name: '系统管理',
        url: '/system',
        icon: 'setting',
        openWay: 'Replace_Tab',
    },
]