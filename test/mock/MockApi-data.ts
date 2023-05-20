// noinspection SpellCheckingInspection,DuplicatedCode

import { Issue } from "@/content/backlog/IssueApi"
import { CustomField, IssueTypeColor, Project, ProjectInfoWithCustomFields } from "@/content/backlog/ProjectInfoApi"

const projectInfoBT: ProjectInfoWithCustomFields = {
  project: {
    id: 78386,
    projectKey: "BT",
    name: "board test",
    chartEnabled: true,
    useResolvedForChart: false,
    subtaskingEnabled: false,
    projectLeaderCanEditProjectLeader: false,
    useWiki: true,
    useFileSharing: true,
    useWikiTreeView: true,
    useSubversion: false,
    useGit: false,
    useOriginalImageSizeAtWiki: false,
    textFormattingRule: "markdown",
    archived: false,
    displayOrder: 2147483646,
    useDevAttributes: true
  } as Project,
  issueTypes: [
    {
      id: 389286,
      projectId: 78386,
      name: "タスク",
      color: IssueTypeColor.pill__issue_type_3,
      displayOrder: 0,
      templateSummary: null,
      templateDescription: null
    },
    {
      id: 389285,
      projectId: 78386,
      name: "バグ",
      color: IssueTypeColor.pill__issue_type_2,
      displayOrder: 1,
      templateSummary: null,
      templateDescription: null
    },
    {
      id: 389287,
      projectId: 78386,
      name: "要望",
      color: IssueTypeColor.pill__issue_type_4,
      displayOrder: 2,
      templateSummary: null,
      templateDescription: null
    },
    {
      id: 389288,
      projectId: 78386,
      name: "その他",
      color: IssueTypeColor.pill__issue_type_7,
      displayOrder: 3,
      templateSummary: null,
      templateDescription: null
    }
  ],
  customFields: [
    {
      id: 71491,
      typeId: 3,
      version: 1674542544000,
      name: "__PBI_ORDER__389286__",
      description: "",
      required: false,
      useIssueType: true,
      applicableIssueTypes: [389286],
      displayOrder: 2147483646,
      min: null,
      max: null,
      initialValue: null,
      unit: null
    } as CustomField
  ],
  statuses: [
    { id: 1, projectId: 78386, name: "未対応", color: "#ed8077", displayOrder: 1000 },
    { id: 2, projectId: 78386, name: "処理中", color: "#4488c5", displayOrder: 2000 },
    { id: 3, projectId: 78386, name: "処理済み", color: "#5eb5a6", displayOrder: 3000 },
    { id: 4, projectId: 78386, name: "完了", color: "#b0be3c", displayOrder: 4000 }
  ],
  milestones: [
    {
      id: 245742,
      projectId: 78386,
      name: "01-24 ~ 01-30 sprint",
      description: "マイルストーン\n複数行\n編集できる",
      startDate: "2023-01-24T00:00:00Z",
      releaseDueDate: "2023-01-30T00:00:00Z",
      archived: false,
      displayOrder: 0
    },
    {
      id: 244967,
      projectId: 78386,
      name: "01-18 ~ 01-24 sprint",
      description: null,
      startDate: "2023-01-18T00:00:00Z",
      releaseDueDate: "2023-01-24T00:00:00Z",
      archived: false,
      displayOrder: 1
    },
    {
      id: 244368,
      projectId: 78386,
      name: "01-12 ~ 01-18 sprint",
      description: null,
      startDate: "2023-01-12T00:00:00Z",
      releaseDueDate: "2023-01-18T00:00:00Z",
      archived: false,
      displayOrder: 2
    },
    {
      id: 241440,
      projectId: 78386,
      name: "12-14 ~ 12-20 sprint",
      description: null,
      startDate: "2022-12-14T00:00:00Z",
      releaseDueDate: "2022-12-20T00:00:00Z",
      archived: true,
      displayOrder: 3
    },
    {
      id: 118793,
      projectId: 78386,
      name: "M2",
      description: null,
      startDate: null,
      releaseDueDate: "2023-03-31T00:00:00Z",
      archived: false,
      displayOrder: 4
    },
    {
      id: 118792,
      projectId: 78386,
      name: "M1",
      description: null,
      startDate: null,
      releaseDueDate: null,
      archived: false,
      displayOrder: 5
    }
  ]
}

const productBacklogBT = [
  {
    id: 20641035,
    projectId: 78386,
    issueKey: "B_T-12",
    keyId: 12,
    issueType: { id: 389286, projectId: 78386, name: "タスク", color: "#7ea800", displayOrder: 0 },
    summary: "もっとあたらしいやっつーができとるやんあ",
    description: "どやこれ\n\nこないなっとんんえん\n\n更新するで",
    resolution: null,
    priority: { id: 3, name: "中" },
    status: { id: 1, projectId: 78386, name: "未対応", color: "#ed8077", displayOrder: 1000 },
    assignee: null,
    category: [],
    versions: [],
    milestone: [
      {
        id: 245742,
        projectId: 78386,
        name: "01-24 ~ 01-30 sprint",
        description: null,
        startDate: "2023-01-24T00:00:00Z",
        releaseDueDate: "2023-01-30T00:00:00Z",
        archived: false,
        displayOrder: 0
      }
    ],
    startDate: null,
    dueDate: null,
    estimatedHours: null,
    actualHours: null,
    parentIssueId: null,
    createdUser: {
      id: 13775,
      userId: "*lXwIJXqbRE",
      name: "fujita@nulab-inc.com",
      roleType: 1,
      lang: "ja",
      mailAddress: "fujita@nulab.com",
      nulabAccount: {
        nulabId: "E82Ng469EldR5eDeAvqZdwUPfcxc6YS6VWl4uMuxKTGWIqtRrH",
        name: "fujitama",
        uniqueId: "fujitama"
      },
      keyword: "fujita@nulab-inc.com fujita@nulab-inc.com",
      lastLoginTime: "2023-01-26T06:34:06Z"
    },
    created: "2023-01-18T02:55:43Z",
    updatedUser: {
      id: 13775,
      userId: "*lXwIJXqbRE",
      name: "fujita@nulab-inc.com",
      roleType: 1,
      lang: "ja",
      mailAddress: "fujita@nulab.com",
      nulabAccount: {
        nulabId: "E82Ng469EldR5eDeAvqZdwUPfcxc6YS6VWl4uMuxKTGWIqtRrH",
        name: "fujitama",
        uniqueId: "fujitama"
      },
      keyword: "fujita@nulab-inc.com fujita@nulab-inc.com",
      lastLoginTime: "2023-01-26T06:34:06Z"
    },
    updated: "2023-01-25T00:33:59Z",
    customFields: [{ id: 71491, fieldTypeId: 3, name: "__PBI_ORDER__389286__", value: -665 }],
    attachments: [],
    sharedFiles: [],
    stars: []
  },
  {
    id: 20640945,
    projectId: 78386,
    issueKey: "B_T-11",
    keyId: 11,
    issueType: { id: 389286, projectId: 78386, name: "タスク", color: "#7ea800", displayOrder: 0 },
    summary: "あたらしいかだいだよ",
    description: "# 見出し\n\n- りすと\n- りすと\n- りすと",
    resolution: null,
    priority: { id: 3, name: "中" },
    status: { id: 1, projectId: 78386, name: "未対応", color: "#ed8077", displayOrder: 1000 },
    assignee: null,
    category: [],
    versions: [],
    milestone: [
      {
        id: 244967,
        projectId: 78386,
        name: "01-18 ~ 01-24 sprint",
        description: null,
        startDate: "2023-01-18T00:00:00Z",
        releaseDueDate: "2023-01-24T00:00:00Z",
        archived: false,
        displayOrder: 1
      }
    ],
    startDate: null,
    dueDate: null,
    estimatedHours: null,
    actualHours: null,
    parentIssueId: null,
    createdUser: {
      id: 13775,
      userId: "*lXwIJXqbRE",
      name: "fujita@nulab-inc.com",
      roleType: 1,
      lang: "ja",
      mailAddress: "fujita@nulab.com",
      nulabAccount: {
        nulabId: "E82Ng469EldR5eDeAvqZdwUPfcxc6YS6VWl4uMuxKTGWIqtRrH",
        name: "fujitama",
        uniqueId: "fujitama"
      },
      keyword: "fujita@nulab-inc.com fujita@nulab-inc.com",
      lastLoginTime: "2023-01-26T06:34:06Z"
    },
    created: "2023-01-18T02:52:31Z",
    updatedUser: {
      id: 13775,
      userId: "*lXwIJXqbRE",
      name: "fujita@nulab-inc.com",
      roleType: 1,
      lang: "ja",
      mailAddress: "fujita@nulab.com",
      nulabAccount: {
        nulabId: "E82Ng469EldR5eDeAvqZdwUPfcxc6YS6VWl4uMuxKTGWIqtRrH",
        name: "fujitama",
        uniqueId: "fujitama"
      },
      keyword: "fujita@nulab-inc.com fujita@nulab-inc.com",
      lastLoginTime: "2023-01-26T06:34:06Z"
    },
    updated: "2023-01-24T23:48:49Z",
    customFields: [{ id: 71491, fieldTypeId: 3, name: "__PBI_ORDER__389286__", value: -765 }],
    attachments: [],
    sharedFiles: [],
    stars: []
  },
  {
    id: 12323249,
    projectId: 78386,
    issueKey: "B_T-10",
    keyId: 10,
    issueType: { id: 389286, projectId: 78386, name: "タスク", color: "#7ea800", displayOrder: 0 },
    summary: "M1 Added from web",
    description: "",
    resolution: null,
    priority: { id: 3, name: "中" },
    status: { id: 2, projectId: 78386, name: "処理中", color: "#4488c5", displayOrder: 2000 },
    assignee: {
      id: 13775,
      userId: "*lXwIJXqbRE",
      name: "fujita@nulab-inc.com",
      roleType: 1,
      lang: "ja",
      mailAddress: "fujita@nulab.com",
      nulabAccount: {
        nulabId: "E82Ng469EldR5eDeAvqZdwUPfcxc6YS6VWl4uMuxKTGWIqtRrH",
        name: "fujitama",
        uniqueId: "fujitama"
      },
      keyword: "fujita@nulab-inc.com fujita@nulab-inc.com",
      lastLoginTime: "2023-01-26T06:34:06Z"
    },
    category: [],
    versions: [],
    milestone: [
      {
        id: 244967,
        projectId: 78386,
        name: "01-18 ~ 01-24 sprint",
        description: null,
        startDate: "2023-01-18T00:00:00Z",
        releaseDueDate: "2023-01-24T00:00:00Z",
        archived: false,
        displayOrder: 1
      }
    ],
    startDate: null,
    dueDate: "2021-06-30T00:00:00Z",
    estimatedHours: null,
    actualHours: null,
    parentIssueId: null,
    createdUser: {
      id: 13775,
      userId: "*lXwIJXqbRE",
      name: "fujita@nulab-inc.com",
      roleType: 1,
      lang: "ja",
      mailAddress: "fujita@nulab.com",
      nulabAccount: {
        nulabId: "E82Ng469EldR5eDeAvqZdwUPfcxc6YS6VWl4uMuxKTGWIqtRrH",
        name: "fujitama",
        uniqueId: "fujitama"
      },
      keyword: "fujita@nulab-inc.com fujita@nulab-inc.com",
      lastLoginTime: "2023-01-26T06:34:06Z"
    },
    created: "2021-06-15T02:23:44Z",
    updatedUser: {
      id: 13775,
      userId: "*lXwIJXqbRE",
      name: "fujita@nulab-inc.com",
      roleType: 1,
      lang: "ja",
      mailAddress: "fujita@nulab.com",
      nulabAccount: {
        nulabId: "E82Ng469EldR5eDeAvqZdwUPfcxc6YS6VWl4uMuxKTGWIqtRrH",
        name: "fujitama",
        uniqueId: "fujitama"
      },
      keyword: "fujita@nulab-inc.com fujita@nulab-inc.com",
      lastLoginTime: "2023-01-26T06:34:06Z"
    },
    updated: "2023-01-25T00:27:16Z",
    customFields: [{ id: 71491, fieldTypeId: 3, name: "__PBI_ORDER__389286__", value: -965 }],
    attachments: [],
    sharedFiles: [],
    stars: []
  },
  {
    id: 12323242,
    projectId: 78386,
    issueKey: "B_T-9",
    keyId: 9,
    issueType: { id: 389286, projectId: 78386, name: "タスク", color: "#7ea800", displayOrder: 0 },
    summary: "サマリーが編集できるよ！eee",
    description:
      "課題の詳細\n\n- リスト\n- リスト\n\n\n# 見出し123\n\n## 見出し2\n\n* [リンク](https://nulab.com/)\n* リスト\n* リスト\n\n1. 順序付きリスト\n2. 順序付き\n\n詳細も編集できる！！",
    resolution: null,
    priority: { id: 3, name: "中" },
    status: { id: 4, projectId: 78386, name: "完了", color: "#b0be3c", displayOrder: 4000 },
    assignee: null,
    category: [],
    versions: [],
    milestone: [
      {
        id: 244967,
        projectId: 78386,
        name: "01-18 ~ 01-24 sprint",
        description: null,
        startDate: "2023-01-18T00:00:00Z",
        releaseDueDate: "2023-01-24T00:00:00Z",
        archived: false,
        displayOrder: 1
      }
    ],
    startDate: null,
    dueDate: null,
    estimatedHours: 13,
    actualHours: 8,
    parentIssueId: null,
    createdUser: {
      id: 13775,
      userId: "*lXwIJXqbRE",
      name: "fujita@nulab-inc.com",
      roleType: 1,
      lang: "ja",
      mailAddress: "fujita@nulab.com",
      nulabAccount: {
        nulabId: "E82Ng469EldR5eDeAvqZdwUPfcxc6YS6VWl4uMuxKTGWIqtRrH",
        name: "fujitama",
        uniqueId: "fujitama"
      },
      keyword: "fujita@nulab-inc.com fujita@nulab-inc.com",
      lastLoginTime: "2023-01-26T06:34:06Z"
    },
    created: "2021-06-15T02:23:21Z",
    updatedUser: {
      id: 13775,
      userId: "*lXwIJXqbRE",
      name: "fujita@nulab-inc.com",
      roleType: 1,
      lang: "ja",
      mailAddress: "fujita@nulab.com",
      nulabAccount: {
        nulabId: "E82Ng469EldR5eDeAvqZdwUPfcxc6YS6VWl4uMuxKTGWIqtRrH",
        name: "fujitama",
        uniqueId: "fujitama"
      },
      keyword: "fujita@nulab-inc.com fujita@nulab-inc.com",
      lastLoginTime: "2023-01-26T06:34:06Z"
    },
    updated: "2023-01-26T02:51:26Z",
    customFields: [{ id: 71491, fieldTypeId: 3, name: "__PBI_ORDER__389286__", value: -2122 }],
    attachments: [],
    sharedFiles: [],
    stars: []
  },
  {
    id: 12322955,
    projectId: 78386,
    issueKey: "B_T-8",
    keyId: 8,
    issueType: { id: 389286, projectId: 78386, name: "タスク", color: "#7ea800", displayOrder: 0 },
    summary: "added 日本語漢字変換の場合は",
    description: "これなら\nいい感じだ\n\ncmd + Enterでも確定できる\nよね\n",
    resolution: null,
    priority: { id: 3, name: "中" },
    status: { id: 4, projectId: 78386, name: "完了", color: "#b0be3c", displayOrder: 4000 },
    assignee: null,
    category: [],
    versions: [],
    milestone: [
      {
        id: 244967,
        projectId: 78386,
        name: "01-18 ~ 01-24 sprint",
        description: null,
        startDate: "2023-01-18T00:00:00Z",
        releaseDueDate: "2023-01-24T00:00:00Z",
        archived: false,
        displayOrder: 1
      }
    ],
    startDate: null,
    dueDate: null,
    estimatedHours: null,
    actualHours: null,
    parentIssueId: null,
    createdUser: {
      id: 13775,
      userId: "*lXwIJXqbRE",
      name: "fujita@nulab-inc.com",
      roleType: 1,
      lang: "ja",
      mailAddress: "fujita@nulab.com",
      nulabAccount: {
        nulabId: "E82Ng469EldR5eDeAvqZdwUPfcxc6YS6VWl4uMuxKTGWIqtRrH",
        name: "fujitama",
        uniqueId: "fujitama"
      },
      keyword: "fujita@nulab-inc.com fujita@nulab-inc.com",
      lastLoginTime: "2023-01-26T06:34:06Z"
    },
    created: "2021-06-15T02:12:41Z",
    updatedUser: {
      id: 13775,
      userId: "*lXwIJXqbRE",
      name: "fujita@nulab-inc.com",
      roleType: 1,
      lang: "ja",
      mailAddress: "fujita@nulab.com",
      nulabAccount: {
        nulabId: "E82Ng469EldR5eDeAvqZdwUPfcxc6YS6VWl4uMuxKTGWIqtRrH",
        name: "fujitama",
        uniqueId: "fujitama"
      },
      keyword: "fujita@nulab-inc.com fujita@nulab-inc.com",
      lastLoginTime: "2023-01-26T06:34:06Z"
    },
    updated: "2023-01-25T00:40:16Z",
    customFields: [{ id: 71491, fieldTypeId: 3, name: "__PBI_ORDER__389286__", value: -1140 }],
    attachments: [],
    sharedFiles: [],
    stars: []
  },
  {
    id: 7177962,
    projectId: 78386,
    issueKey: "B_T-7",
    keyId: 7,
    issueType: { id: 389286, projectId: 78386, name: "タスク", color: "#7ea800", displayOrder: 0 },
    summary: "M1fujita3",
    description: "",
    resolution: null,
    priority: { id: 3, name: "中" },
    status: { id: 4, projectId: 78386, name: "完了", color: "#b0be3c", displayOrder: 4000 },
    assignee: {
      id: 13775,
      userId: "*lXwIJXqbRE",
      name: "fujita@nulab-inc.com",
      roleType: 1,
      lang: "ja",
      mailAddress: "fujita@nulab.com",
      nulabAccount: {
        nulabId: "E82Ng469EldR5eDeAvqZdwUPfcxc6YS6VWl4uMuxKTGWIqtRrH",
        name: "fujitama",
        uniqueId: "fujitama"
      },
      keyword: "fujita@nulab-inc.com fujita@nulab-inc.com",
      lastLoginTime: "2023-01-26T06:34:06Z"
    },
    category: [],
    versions: [],
    milestone: [
      {
        id: 245742,
        projectId: 78386,
        name: "01-24 ~ 01-30 sprint",
        description: null,
        startDate: "2023-01-24T00:00:00Z",
        releaseDueDate: "2023-01-30T00:00:00Z",
        archived: false,
        displayOrder: 0
      }
    ],
    startDate: null,
    dueDate: null,
    estimatedHours: 3,
    actualHours: 5,
    parentIssueId: null,
    createdUser: {
      id: 13775,
      userId: "*lXwIJXqbRE",
      name: "fujita@nulab-inc.com",
      roleType: 1,
      lang: "ja",
      mailAddress: "fujita@nulab.com",
      nulabAccount: {
        nulabId: "E82Ng469EldR5eDeAvqZdwUPfcxc6YS6VWl4uMuxKTGWIqtRrH",
        name: "fujitama",
        uniqueId: "fujitama"
      },
      keyword: "fujita@nulab-inc.com fujita@nulab-inc.com",
      lastLoginTime: "2023-01-26T06:34:06Z"
    },
    created: "2020-03-27T01:44:42Z",
    updatedUser: {
      id: 13775,
      userId: "*lXwIJXqbRE",
      name: "fujita@nulab-inc.com",
      roleType: 1,
      lang: "ja",
      mailAddress: "fujita@nulab.com",
      nulabAccount: {
        nulabId: "E82Ng469EldR5eDeAvqZdwUPfcxc6YS6VWl4uMuxKTGWIqtRrH",
        name: "fujitama",
        uniqueId: "fujitama"
      },
      keyword: "fujita@nulab-inc.com fujita@nulab-inc.com",
      lastLoginTime: "2023-01-26T06:34:06Z"
    },
    updated: "2023-01-26T00:40:43Z",
    customFields: [{ id: 71491, fieldTypeId: 3, name: "__PBI_ORDER__389286__", value: -3509 }],
    attachments: [],
    sharedFiles: [],
    stars: []
  },
  {
    id: 7177959,
    projectId: 78386,
    issueKey: "B_T-6",
    keyId: 6,
    issueType: { id: 389286, projectId: 78386, name: "タスク", color: "#7ea800", displayOrder: 0 },
    summary: "Markdownで処理する",
    description: "更新できる？\n\n# 見出し",
    resolution: null,
    priority: { id: 3, name: "中" },
    status: { id: 4, projectId: 78386, name: "完了", color: "#b0be3c", displayOrder: 4000 },
    assignee: {
      id: 13775,
      userId: "*lXwIJXqbRE",
      name: "fujita@nulab-inc.com",
      roleType: 1,
      lang: "ja",
      mailAddress: "fujita@nulab.com",
      nulabAccount: {
        nulabId: "E82Ng469EldR5eDeAvqZdwUPfcxc6YS6VWl4uMuxKTGWIqtRrH",
        name: "fujitama",
        uniqueId: "fujitama"
      },
      keyword: "fujita@nulab-inc.com fujita@nulab-inc.com",
      lastLoginTime: "2023-01-26T06:34:06Z"
    },
    category: [],
    versions: [],
    milestone: [
      {
        id: 245742,
        projectId: 78386,
        name: "01-24 ~ 01-30 sprint",
        description: null,
        startDate: "2023-01-24T00:00:00Z",
        releaseDueDate: "2023-01-30T00:00:00Z",
        archived: false,
        displayOrder: 0
      }
    ],
    startDate: null,
    dueDate: null,
    estimatedHours: 5,
    actualHours: null,
    parentIssueId: null,
    createdUser: {
      id: 13775,
      userId: "*lXwIJXqbRE",
      name: "fujita@nulab-inc.com",
      roleType: 1,
      lang: "ja",
      mailAddress: "fujita@nulab.com",
      nulabAccount: {
        nulabId: "E82Ng469EldR5eDeAvqZdwUPfcxc6YS6VWl4uMuxKTGWIqtRrH",
        name: "fujitama",
        uniqueId: "fujitama"
      },
      keyword: "fujita@nulab-inc.com fujita@nulab-inc.com",
      lastLoginTime: "2023-01-26T06:34:06Z"
    },
    created: "2020-03-27T01:44:37Z",
    updatedUser: {
      id: 13775,
      userId: "*lXwIJXqbRE",
      name: "fujita@nulab-inc.com",
      roleType: 1,
      lang: "ja",
      mailAddress: "fujita@nulab.com",
      nulabAccount: {
        nulabId: "E82Ng469EldR5eDeAvqZdwUPfcxc6YS6VWl4uMuxKTGWIqtRrH",
        name: "fujitama",
        uniqueId: "fujitama"
      },
      keyword: "fujita@nulab-inc.com fujita@nulab-inc.com",
      lastLoginTime: "2023-01-26T06:34:06Z"
    },
    updated: "2023-01-26T02:51:13Z",
    customFields: [{ id: 71491, fieldTypeId: 3, name: "__PBI_ORDER__389286__", value: -3209 }],
    attachments: [],
    sharedFiles: [],
    stars: []
  } as Issue,
  {
    id: 7177956,
    projectId: 78386,
    issueKey: "B_T-5",
    keyId: 5,
    issueType: { id: 389286, projectId: 78386, name: "タスク", color: "#7ea800", displayOrder: 0 },
    summary: "M1fujitaなんやでーややややや確定前fixed",
    description: "詳細を書き込んじゃうよ",
    resolution: null,
    priority: { id: 3, name: "中" },
    status: { id: 4, projectId: 78386, name: "完了", color: "#b0be3c", displayOrder: 4000 },
    assignee: {
      id: 13775,
      userId: "*lXwIJXqbRE",
      name: "fujita@nulab-inc.com",
      roleType: 1,
      lang: "ja",
      mailAddress: "fujita@nulab.com",
      nulabAccount: {
        nulabId: "E82Ng469EldR5eDeAvqZdwUPfcxc6YS6VWl4uMuxKTGWIqtRrH",
        name: "fujitama",
        uniqueId: "fujitama"
      },
      keyword: "fujita@nulab-inc.com fujita@nulab-inc.com",
      lastLoginTime: "2023-01-26T06:34:06Z"
    },
    category: [],
    versions: [],
    milestone: [
      {
        id: 245742,
        projectId: 78386,
        name: "01-24 ~ 01-30 sprint",
        description: null,
        startDate: "2023-01-24T00:00:00Z",
        releaseDueDate: "2023-01-30T00:00:00Z",
        archived: false,
        displayOrder: 0
      }
    ],
    startDate: null,
    dueDate: null,
    estimatedHours: 8,
    actualHours: null,
    parentIssueId: null,
    createdUser: {
      id: 13775,
      userId: "*lXwIJXqbRE",
      name: "fujita@nulab-inc.com",
      roleType: 1,
      lang: "ja",
      mailAddress: "fujita@nulab.com",
      nulabAccount: {
        nulabId: "E82Ng469EldR5eDeAvqZdwUPfcxc6YS6VWl4uMuxKTGWIqtRrH",
        name: "fujitama",
        uniqueId: "fujitama"
      },
      keyword: "fujita@nulab-inc.com fujita@nulab-inc.com",
      lastLoginTime: "2023-01-26T06:34:06Z"
    },
    created: "2020-03-27T01:44:34Z",
    updatedUser: {
      id: 13775,
      userId: "*lXwIJXqbRE",
      name: "fujita@nulab-inc.com",
      roleType: 1,
      lang: "ja",
      mailAddress: "fujita@nulab.com",
      nulabAccount: {
        nulabId: "E82Ng469EldR5eDeAvqZdwUPfcxc6YS6VWl4uMuxKTGWIqtRrH",
        name: "fujitama",
        uniqueId: "fujitama"
      },
      keyword: "fujita@nulab-inc.com fujita@nulab-inc.com",
      lastLoginTime: "2023-01-26T06:34:06Z"
    },
    updated: "2023-01-26T02:51:19Z",
    customFields: [{ id: 71491, fieldTypeId: 3, name: "__PBI_ORDER__389286__", value: -3109 }],
    attachments: [],
    sharedFiles: [],
    stars: []
  },
  {
    id: 6473987,
    projectId: 78386,
    issueKey: "B_T-3",
    keyId: 3,
    issueType: { id: 389286, projectId: 78386, name: "タスク", color: "#7ea800", displayOrder: 0 },
    summary: "編集できる",
    description: "# 見出し\n\nマークダウンも\n\n## いける\n\nいけるね",
    resolution: null,
    priority: { id: 3, name: "中" },
    status: { id: 1, projectId: 78386, name: "未対応", color: "#ed8077", displayOrder: 1000 },
    assignee: null,
    category: [],
    versions: [],
    milestone: [
      {
        id: 245742,
        projectId: 78386,
        name: "01-24 ~ 01-30 sprint",
        description: null,
        startDate: "2023-01-24T00:00:00Z",
        releaseDueDate: "2023-01-30T00:00:00Z",
        archived: false,
        displayOrder: 0
      }
    ],
    startDate: null,
    dueDate: null,
    estimatedHours: null,
    actualHours: null,
    parentIssueId: null,
    createdUser: {
      id: 13775,
      userId: "*lXwIJXqbRE",
      name: "fujita@nulab-inc.com",
      roleType: 1,
      lang: "ja",
      mailAddress: "fujita@nulab.com",
      nulabAccount: {
        nulabId: "E82Ng469EldR5eDeAvqZdwUPfcxc6YS6VWl4uMuxKTGWIqtRrH",
        name: "fujitama",
        uniqueId: "fujitama"
      },
      keyword: "fujita@nulab-inc.com fujita@nulab-inc.com",
      lastLoginTime: "2023-01-26T06:34:06Z"
    },
    created: "2020-01-29T06:53:00Z",
    updatedUser: {
      id: 13775,
      userId: "*lXwIJXqbRE",
      name: "fujita@nulab-inc.com",
      roleType: 1,
      lang: "ja",
      mailAddress: "fujita@nulab.com",
      nulabAccount: {
        nulabId: "E82Ng469EldR5eDeAvqZdwUPfcxc6YS6VWl4uMuxKTGWIqtRrH",
        name: "fujitama",
        uniqueId: "fujitama"
      },
      keyword: "fujita@nulab-inc.com fujita@nulab-inc.com",
      lastLoginTime: "2023-01-26T06:34:06Z"
    },
    updated: "2023-01-26T00:28:47Z",
    customFields: [{ id: 71491, fieldTypeId: 3, name: "__PBI_ORDER__389286__", value: -3309 }],
    attachments: [],
    sharedFiles: [],
    stars: []
  },
  {
    id: 6473986,
    projectId: 78386,
    issueKey: "B_T-2",
    keyId: 2,
    issueType: { id: 389286, projectId: 78386, name: "タスク", color: "#7ea800", displayOrder: 0 },
    summary: "abcではじめようこれなら",
    description: "",
    resolution: null,
    priority: { id: 3, name: "中" },
    status: { id: 1, projectId: 78386, name: "未対応", color: "#ed8077", displayOrder: 1000 },
    assignee: null,
    category: [],
    versions: [],
    milestone: [
      {
        id: 245742,
        projectId: 78386,
        name: "01-24 ~ 01-30 sprint",
        description: null,
        startDate: "2023-01-24T00:00:00Z",
        releaseDueDate: "2023-01-30T00:00:00Z",
        archived: false,
        displayOrder: 0
      }
    ],
    startDate: null,
    dueDate: null,
    estimatedHours: 1,
    actualHours: null,
    parentIssueId: null,
    createdUser: {
      id: 13775,
      userId: "*lXwIJXqbRE",
      name: "fujita@nulab-inc.com",
      roleType: 1,
      lang: "ja",
      mailAddress: "fujita@nulab.com",
      nulabAccount: {
        nulabId: "E82Ng469EldR5eDeAvqZdwUPfcxc6YS6VWl4uMuxKTGWIqtRrH",
        name: "fujitama",
        uniqueId: "fujitama"
      },
      keyword: "fujita@nulab-inc.com fujita@nulab-inc.com",
      lastLoginTime: "2023-01-26T06:34:06Z"
    },
    created: "2020-01-29T06:52:59Z",
    updatedUser: {
      id: 13775,
      userId: "*lXwIJXqbRE",
      name: "fujita@nulab-inc.com",
      roleType: 1,
      lang: "ja",
      mailAddress: "fujita@nulab.com",
      nulabAccount: {
        nulabId: "E82Ng469EldR5eDeAvqZdwUPfcxc6YS6VWl4uMuxKTGWIqtRrH",
        name: "fujitama",
        uniqueId: "fujitama"
      },
      keyword: "fujita@nulab-inc.com fujita@nulab-inc.com",
      lastLoginTime: "2023-01-26T06:34:06Z"
    },
    updated: "2023-01-26T02:51:06Z",
    customFields: [{ id: 71491, fieldTypeId: 3, name: "__PBI_ORDER__389286__", value: -3409 }],
    attachments: [],
    sharedFiles: [],
    stars: []
  }
] as Issue[]

const childIssuesBT = [
  {
    id: 20641035,
    projectId: 78386,
    issueKey: "B_T-12",
    keyId: 12,
    issueType: {
      id: 389285,
      projectId: 78386,
      name: "バグ",
      color: IssueTypeColor.pill__issue_type_2,
      displayOrder: 1
    },
    summary: "もっとあたらしいやっつーができとるやんあ",
    description: "どやこれ\n\nこないなっとんんえん\n\n更新するで",
    resolution: null,
    priority: { id: 3, name: "中" },
    status: { id: 4, projectId: 78386, name: "完了", color: "#b0be3c", displayOrder: 4000 },
    assignee: null,
    category: [],
    versions: [],
    milestone: [
      {
        id: 245742,
        projectId: 78386,
        name: "01-24 ~ 01-30 sprint",
        description: null,
        startDate: "2023-01-24T00:00:00Z",
        releaseDueDate: "2023-01-30T00:00:00Z",
        archived: false,
        displayOrder: 0
      }
    ],
    startDate: null,
    dueDate: null,
    estimatedHours: null,
    actualHours: null,
    parentIssueId: null,
    createdUser: {
      id: 13775,
      userId: "*lXwIJXqbRE",
      name: "fujita@nulab-inc.com",
      roleType: 1,
      lang: "ja",
      mailAddress: "fujita@nulab.com",
      nulabAccount: {
        nulabId: "E82Ng469EldR5eDeAvqZdwUPfcxc6YS6VWl4uMuxKTGWIqtRrH",
        name: "fujitama",
        uniqueId: "fujitama"
      },
      keyword: "fujita@nulab-inc.com fujita@nulab-inc.com",
      lastLoginTime: "2023-01-26T06:34:06Z"
    },
    created: "2023-01-18T02:55:43Z",
    updatedUser: {
      id: 13775,
      userId: "*lXwIJXqbRE",
      name: "fujita@nulab-inc.com",
      roleType: 1,
      lang: "ja",
      mailAddress: "fujita@nulab.com",
      nulabAccount: {
        nulabId: "E82Ng469EldR5eDeAvqZdwUPfcxc6YS6VWl4uMuxKTGWIqtRrH",
        name: "fujitama",
        uniqueId: "fujitama"
      },
      keyword: "fujita@nulab-inc.com fujita@nulab-inc.com",
      lastLoginTime: "2023-01-26T06:34:06Z"
    },
    updated: "2023-01-25T00:33:59Z",
    customFields: [{ id: 71491, fieldTypeId: 3, name: "__PBI_ORDER__389286__", value: -665 }],
    attachments: [],
    sharedFiles: [],
    stars: []
  },
  {
    id: 20640945,
    projectId: 78386,
    issueKey: "B_T-11",
    keyId: 11,
    issueType: {
      id: 389285,
      projectId: 78386,
      name: "バグ",
      color: IssueTypeColor.pill__issue_type_2,
      displayOrder: 1
    },
    summary: "あたらしいかだいだよ",
    description: "# 見出し\n\n- りすと\n- りすと\n- りすと",
    resolution: null,
    priority: { id: 3, name: "中" },
    status: { id: 4, projectId: 78386, name: "完了", color: "#b0be3c", displayOrder: 4000 },
    assignee: null,
    category: [],
    versions: [],
    milestone: [
      {
        id: 245742,
        projectId: 78386,
        name: "01-24 ~ 01-30 sprint",
        description: null,
        startDate: "2023-01-24T00:00:00Z",
        releaseDueDate: "2023-01-30T00:00:00Z",
        archived: false,
        displayOrder: 0
      }
    ],
    startDate: null,
    dueDate: null,
    estimatedHours: null,
    actualHours: null,
    parentIssueId: null,
    createdUser: {
      id: 13775,
      userId: "*lXwIJXqbRE",
      name: "fujita@nulab-inc.com",
      roleType: 1,
      lang: "ja",
      mailAddress: "fujita@nulab.com",
      nulabAccount: {
        nulabId: "E82Ng469EldR5eDeAvqZdwUPfcxc6YS6VWl4uMuxKTGWIqtRrH",
        name: "fujitama",
        uniqueId: "fujitama"
      },
      keyword: "fujita@nulab-inc.com fujita@nulab-inc.com",
      lastLoginTime: "2023-01-26T06:34:06Z"
    },
    created: "2023-01-18T02:52:31Z",
    updatedUser: {
      id: 13775,
      userId: "*lXwIJXqbRE",
      name: "fujita@nulab-inc.com",
      roleType: 1,
      lang: "ja",
      mailAddress: "fujita@nulab.com",
      nulabAccount: {
        nulabId: "E82Ng469EldR5eDeAvqZdwUPfcxc6YS6VWl4uMuxKTGWIqtRrH",
        name: "fujitama",
        uniqueId: "fujitama"
      },
      keyword: "fujita@nulab-inc.com fujita@nulab-inc.com",
      lastLoginTime: "2023-01-26T06:34:06Z"
    },
    updated: "2023-01-24T23:48:49Z",
    customFields: [{ id: 71491, fieldTypeId: 3, name: "__PBI_ORDER__389286__", value: -765 }],
    attachments: [],
    sharedFiles: [],
    stars: []
  },
  {
    id: 12323249,
    projectId: 78386,
    issueKey: "B_T-10",
    keyId: 10,
    issueType: {
      id: 389285,
      projectId: 78386,
      name: "バグ",
      color: IssueTypeColor.pill__issue_type_2,
      displayOrder: 1
    },
    summary: "M1 Added from web",
    description: "",
    resolution: null,
    priority: { id: 3, name: "中" },
    status: { id: 4, projectId: 78386, name: "完了", color: "#b0be3c", displayOrder: 4000 },
    assignee: {
      id: 13775,
      userId: "*lXwIJXqbRE",
      name: "fujita@nulab-inc.com",
      roleType: 1,
      lang: "ja",
      mailAddress: "fujita@nulab.com",
      nulabAccount: {
        nulabId: "E82Ng469EldR5eDeAvqZdwUPfcxc6YS6VWl4uMuxKTGWIqtRrH",
        name: "fujitama",
        uniqueId: "fujitama"
      },
      keyword: "fujita@nulab-inc.com fujita@nulab-inc.com",
      lastLoginTime: "2023-01-26T06:34:06Z"
    },
    category: [],
    versions: [],
    milestone: [
      {
        id: 245742,
        projectId: 78386,
        name: "01-24 ~ 01-30 sprint",
        description: null,
        startDate: "2023-01-24T00:00:00Z",
        releaseDueDate: "2023-01-30T00:00:00Z",
        archived: false,
        displayOrder: 0
      }
    ],
    startDate: null,
    dueDate: "2021-06-30T00:00:00Z",
    estimatedHours: null,
    actualHours: null,
    parentIssueId: null,
    createdUser: {
      id: 13775,
      userId: "*lXwIJXqbRE",
      name: "fujita@nulab-inc.com",
      roleType: 1,
      lang: "ja",
      mailAddress: "fujita@nulab.com",
      nulabAccount: {
        nulabId: "E82Ng469EldR5eDeAvqZdwUPfcxc6YS6VWl4uMuxKTGWIqtRrH",
        name: "fujitama",
        uniqueId: "fujitama"
      },
      keyword: "fujita@nulab-inc.com fujita@nulab-inc.com",
      lastLoginTime: "2023-01-26T06:34:06Z"
    },
    created: "2021-06-15T02:23:44Z",
    updatedUser: {
      id: 13775,
      userId: "*lXwIJXqbRE",
      name: "fujita@nulab-inc.com",
      roleType: 1,
      lang: "ja",
      mailAddress: "fujita@nulab.com",
      nulabAccount: {
        nulabId: "E82Ng469EldR5eDeAvqZdwUPfcxc6YS6VWl4uMuxKTGWIqtRrH",
        name: "fujitama",
        uniqueId: "fujitama"
      },
      keyword: "fujita@nulab-inc.com fujita@nulab-inc.com",
      lastLoginTime: "2023-01-26T06:34:06Z"
    },
    updated: "2023-01-25T00:27:16Z",
    customFields: [{ id: 71491, fieldTypeId: 3, name: "__PBI_ORDER__389286__", value: -965 }],
    attachments: [],
    sharedFiles: [],
    stars: []
  } as Issue
] as Issue[]

export const MockData = {
  projectInfoBT,
  productBacklogBT,
  childIssuesBT
}
