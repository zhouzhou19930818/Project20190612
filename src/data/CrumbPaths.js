import { prefixRoute } from "../configs";

export default [
    {
        name: '磁盘故障修复',
        icon: '',
        children: [
            {
                name: '磁盘故障列表',
                url: prefixRoute + '/disk_trouble_list',
                icon: '',
            },
            {
                name: '磁盘修复历史',
                url: prefixRoute + '/disk_trouble_history',
                icon: '',
            },
        ],
    },
    {
        name: 'yarn性能分析',
        icon: '',
        children: [
            {
                name: '报表分析',
                url: prefixRoute + '/yarn/analysis',
                icon: '',
            }
        ],
    },
    {
        name: '自动化装机',
        icon: '',
        children: [
            {
                name: '装机管理',
                url: prefixRoute + '/auto_install_manage',
                icon: '',
                children: [
                    {
                        name: '创建装机任务',
                        url: prefixRoute + '/install_task_create',
                        icon: '',
                    },
                ],
            },
            {
                name: '模板管理',
                url: prefixRoute + '/template_manage',
                icon: '',
                children: [
                    {
                        name: '创建装机模版',
                        url: prefixRoute + '/install_template_create',
                        icon: '',
                    },
                ],
            },
            {
                name: '镜像管理',
                url: prefixRoute + '/mirror_manage',
                icon: '',
                children: [
                    {
                        name: '新增镜像',
                        url: prefixRoute + '/mirror_create',
                        icon: '',
                    },
                ],
            },
            {
                name: 'KS文件管理',
                url: prefixRoute + '/fs_file_manage',
                icon: '',
                children: [
                    {
                        name: '新增ks文件',
                        url: prefixRoute + '/fs_file_create',
                        icon: '',
                    },
                ],
            },
            {
                name: 'DHCP文件管理',
                url: prefixRoute + '/dhcp_manage',
                icon: '',
                children: [],
            },
        ],
    },

];