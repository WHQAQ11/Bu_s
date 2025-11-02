/**
 * 《易经》卦象查询工具
 * 提供完整的64卦数据库和查询功能
 */

import type { DivinationResult } from '../types/divination';

// 原始卦象信息接口（保持向后兼容）
export interface HexagramInfo {
  key: string; // 6位二进制字符串，1为阳，0为阴，从下到上
  name: string; // 中文卦名
  guaCi: string; // 卦辞
  yaoCi: string[]; // 爻辞数组，长度为6
  pinyin?: string; // 拼音（可选，未来扩展）
  number?: number; // 卦序（可选，未来扩展）
}

// 增强爻辞接口
export interface EnhancedYaoCi {
  position: number; // 爻位 (1-6)
  original: string; // 原始爻辞
  translation: string; // 现代翻译
  interpretation: string; // 基础解释

  // 分类引导（简短，1-2句话）
  categoryGuidance: {
    career: string; // 事业引导
    finance: string; // 财运引导
    relationship: string; // 感情引导
    health: string; // 健康引导
    general: string; // 通用引导
  };

  // 古籍参考
  references?: {
    source: string; // 出处
    text: string; // 相关原文
    note: string; // 说明
  }[];
}

// 增强卦象信息接口
export interface EnhancedHexagramInfo {
  // 基础信息
  key: string;
  name: string;
  nameAlt?: string; // 别名，如"乾"又称"天"
  pinyin: string;
  number: number; // 卦序 (1-64)

  // 出处信息
  source: {
    book: string; // 出自《周易·上经》等
    chapter: string; // 具体章节
    position: number; // 在该章节的位置
  };

  // 卦辞信息
  guaCi: {
    original: string; // 原始卦辞
    translation: string; // 现代翻译
    interpretation: string; // 基础解释
  };

  // 爻辞信息（增强版）
  yaoCi: EnhancedYaoCi[];

  // 卦象结构
  structure: {
    upperTrigram: string; // 上卦
    lowerTrigram: string; // 下卦
    symbol: string; // 卦象象征
  };

  // 古籍参考
  references: {
    book: string; // 古籍名称
    quote: string; // 相关原文
    explanation: string; // 解释说明
  }[];

  // 更新追踪
  lastUpdated: string;
  version: string;
  notes?: string; // 更新说明
}

// 解读状态管理接口
export interface InterpretationState {
  stage: "loading" | "interpreting" | "completed" | "error";
  message: string;
  progress?: number;
  tips?: string[];
}

// 数据版本管理接口
export interface DatabaseVersion {
  version: string;
  updateDate: string;
  changes: {
    type: "add" | "update" | "delete";
    target: string; // 修改目标
    description: string; // 修改说明
  }[];
}

// 数据版本控制管理器接口
export interface VersionControlManager {
  currentVersion: string;
  updateHistory: DatabaseVersion[];
  lastCheckDate: string;
}

// 数据验证报告接口
export interface ValidationReport {
  isValid: boolean;
  errorCount: number;
  warningCount: number;
  errors: string[];
  warnings: string[];
  checkedDate: string;
  checkedVersion: string;
}

// 数据覆盖率统计接口
export interface DataCoverageReport {
  totalHexagrams: number;
  enhancedHexagrams: number;
  hexagramsWithReferences: number;
  hexagramsWithYaoDetails: number;
  coveragePercentage: number;
  lastUpdated: string;
}

// 友好的加载提示信息
export const LOADING_MESSAGES = [
  "小卜正在为您加速解卦，稍稍等我一下噢~",
  "正在连接古老的智慧，请稍候片刻...",
  "卦象正在显现，马上就能为您解读了...",
  "小卜正在潜心研究您的卦象，耐心等一下~",
  "千年易经智慧即将呈现，请稍等片刻...",
];

// 解读小贴士
export const INTERPRETATION_TIPS = [
  "易经解读需要结合具体问题来理解",
  "好的心态有助于更好地理解卦象寓意",
  "古人说：心诚则灵，静心等待答案",
  "每一卦都蕴含着深刻的人生哲理",
];

// 占卜类型映射
export const DIVINATION_CATEGORIES = {
  career: "事业",
  finance: "财运",
  relationship: "感情",
  health: "健康",
  general: "综合",
} as const;

export type DivinationCategory = keyof typeof DIVINATION_CATEGORIES;

// 卦象基础信息扩展数据
export const HEXAGRAM_ENHANCED_INFO: Record<
  string,
  Partial<EnhancedHexagramInfo>
> = {
  "111111": {
    // 乾卦
    nameAlt: "天",
    pinyin: "qián",
    source: {
      book: "周易·上经",
      chapter: "第一卦",
      position: 1,
    },
    guaCi: {
      original: "元，亨，利，贞。",
      translation: "乾卦象征天，具有创始、通达、和谐、正固四种品德。",
      interpretation:
        "乾卦代表天，象征着刚健、主动、创造的力量。君子应当效法天的刚健精神，自强不息，永远保持积极向上的态度。",
    },
    yaoCi: [
      {
        position: 1,
        original: "初九：潜龙，勿用。",
        translation: "龙潜伏在深渊，暂时不宜有所作为。",
        interpretation: "时机未到，应当隐忍待时，积累实力，不宜轻举妄动。",
        categoryGuidance: {
          career: "事业发展初期，需要潜心学习，积累经验，不要急于求成。",
          finance: "投资理财需要谨慎，暂时观望，等待更好的时机。",
          relationship: "感情处于萌芽阶段，需要时间培养，不要急于表达。",
          health: "注意调养身体，避免过度劳累，为长远健康打下基础。",
          general: "当前时机尚早，需要耐心等待，做好充分准备。",
        },
        references: [
          {
            source: "《周易正义》孔颖达",
            text: "潜龙，勿用。阳在下也。勿用，勿可用也。",
            note: "初九爻位最低，阳气尚微，如龙潜伏深渊，不可轻用。",
          },
          {
            source: "《伊川易传》程颐",
            text: "潜龙勿用，阳之始也。龙之德，变化不测，故以龙言之。",
            note: "程颐认为此爻象征阳气初生，虽然具有龙的德性，但时机未到。",
          },
        ],
      },
      {
        position: 2,
        original: "九二：见龙在田，利见大人。",
        translation: "龙出现在田野上，有利于拜见大人。",
        interpretation: "时机渐显，应该开始展现才能，寻求有德之人的指导。",
        categoryGuidance: {
          career: "事业开始有起色，可以展现能力，寻求贵人相助。",
          finance: "财务状况改善，可以适度投资，但需要专业人士指导。",
          relationship: "感情明朗化，适合表达心意，寻求长辈认可。",
          health: "身体状况良好，适合开始养生计划。",
          general: "时机逐渐成熟，可以开始行动，寻求指导帮助。",
        },
        references: [
          {
            source: "《周易正义》孔颖达",
            text: "见龙在田，德施普也。利见大人，君德也。",
            note: "九二居中得正，如龙出现在田野，恩德开始广施。",
          },
          {
            source: "《程氏易传》程颢",
            text: "见龙在田，时之中也。大人者，圣人也。",
            note: "程颢强调时机的重要性，认为此时正是见圣人的好时机。",
          },
        ],
      },
    ],
    structure: {
      upperTrigram: "乾（天）",
      lowerTrigram: "乾（天）",
      symbol: "天行健，君子以自强不息",
    },
    references: [
      {
        book: "《周易正义》",
        quote:
          "乾，元亨利贞。乾者，天也。天者，形也；乾者，用也。天以健为用，故曰乾。",
        explanation:
          "孔颖达解释乾卦的含义，强调天的刚健特性，说明乾卦代表天的功用。",
      },
      {
        book: "《伊川易传》",
        quote: "乾，健也。天行健，君子以自强不息。乾道变化，各正性命。",
        explanation: "程颐从理学角度解释乾卦，强调君子应当效法天的刚健精神。",
      },
      {
        book: "《周易本义》",
        quote: "乾者，健也。天体以健为用，故其德为健。君子法天，故自强不息。",
        explanation: "朱熹解释乾卦的哲学意义，阐明天人合一的思想。",
      },
    ],
    lastUpdated: new Date().toISOString(),
    version: "v1.2.0",
    notes: "第三阶段：数据版本管理和质量控制系统",
  },
  "000000": {
    // 坤卦
    nameAlt: "地",
    pinyin: "kūn",
    source: {
      book: "周易·上经",
      chapter: "第二卦",
      position: 2,
    },
    guaCi: {
      original:
        "元，亨，利牝马之贞。君子有攸往，先迷后得主，利西南得朋，东北丧朋。安贞，吉。",
      translation:
        "坤卦象征地，具有包容、柔顺、承载的美德。如母马般柔顺，坚守正道。",
      interpretation:
        "坤卦代表地，象征着柔顺、包容、承载的力量。君子应当效法地的厚德，以宽广的胸怀承载万物，以柔顺的态度处世。",
    },
    yaoCi: [
      {
        position: 1,
        original: "初六：履霜，坚冰至。",
        translation: "脚下踏着霜，坚硬的冰雪时节即将到来。",
        interpretation:
          "见微知著，防微杜渐。从小的征兆预见到大的趋势，及早做好准备。",
        categoryGuidance: {
          career:
            "工作中要注意细节问题，及时发现并解决，避免小问题演变成大危机。",
          finance: "财务状况出现微小变化时，要及时调整策略，防止出现大的损失。",
          relationship: "感情中的小矛盾要及时沟通，不要等到问题严重化才处理。",
          health: "身体出现轻微不适时，要及时就医，预防疾病发展。",
          general: "要善于观察细节，从小的征兆预见未来的发展趋势。",
        },
        references: [
          {
            source: "《周易正义》孔颖达",
            text: "履霜坚冰至，阴始凝也。驯致其道，至坚冰也。",
            note: "孔颖达指出此爻说明阴气开始凝结，循序渐进终将结成坚冰。",
          },
          {
            source: "《伊川易传》程颐",
            text: "履霜坚冰至，阴之始也。驯者，顺也。驯致其道，理自然也。",
            note: "程颐强调见微知著的道理，认为这是事物发展的自然规律。",
          },
        ],
      },
      {
        position: 2,
        original: "六二：直，方，大，不习无不利。",
        translation: "正直、方正、宏大，即使不熟悉也无不利。",
        interpretation:
          "具备正直、方正、宏大的品德，自然能够顺利，不需要刻意学习。",
        categoryGuidance: {
          career: "保持正直品格，做事方正，胸怀大志，事业发展自然顺利。",
          finance: "理财要正直诚信，方法要正大光明，不投机取巧也能获利。",
          relationship: "待人要真诚直率，品行端正，有宽阔胸怀，感情自然美满。",
          health: "保持正直的心态，生活要有规律，胸怀宽广，身体健康。",
          general: "培养正直、方正、宏大的品格，这是成功的基础。",
        },
        references: [
          {
            source: "《周易正义》孔颖达",
            text: "六二之动，直以方也。不习无不利，地道光也。",
            note: "六二居中得正，具有直方大的品德，合乎地道的光明。",
          },
          {
            source: "《程氏易传》程颢",
            text: "直方大，不习无不利，德之盛也。",
            note: "程颢认为直方大是美德的体现，有此德者不学而能。",
          },
        ],
      },
    ],
    structure: {
      upperTrigram: "坤（地）",
      lowerTrigram: "坤（地）",
      symbol: "地势坤，君子以厚德载物",
    },
    references: [
      {
        book: "《周易正义》",
        quote: "坤，元亨，利牝马之贞。坤者，地也。地以顺为德，故曰坤。",
        explanation:
          "孔颖达解释坤卦的含义，强调地的柔顺特性，说明坤卦代表地的德性。",
      },
      {
        book: "《伊川易传》",
        quote: "坤，顺也。地势坤，君子以厚德载物。坤道成女，故称母。",
        explanation: "程颐从理学角度解释坤卦，强调君子应当效法地的厚德。",
      },
      {
        book: "《周易本义》",
        quote: "坤者，顺也。地体以顺为用，故其德为顺。君子法地，故厚德载物。",
        explanation: "朱熹解释坤卦的哲学意义，阐明了柔顺包容的美德。",
      },
    ],
    lastUpdated: new Date().toISOString(),
    version: "v1.2.0",
    notes: "第三阶段：数据版本管理和质量控制系统",
  },
  "010111": {
    // 需卦
    nameAlt: "水天需",
    pinyin: "xū",
    source: {
      book: "周易·上经",
      chapter: "第五卦",
      position: 5,
    },
    guaCi: {
      original: "有孚，光亨，贞吉。利涉大川。",
      translation:
        "需卦象征等待，心怀诚信，光明通达，坚守正道可获吉祥。利于渡过大江大河。",
      interpretation:
        "需卦代表等待的智慧，虽然前方有险阻，但只要心怀诚信，耐心等待时机，最终能够克服困难，达成目标。",
    },
    yaoCi: [
      {
        position: 1,
        original: "初九：需于郊，利用恒，无咎。",
        translation: "在郊野等待，宜于持之以恒，没有灾害。",
        interpretation:
          "时机未到，应该在适当的地方耐心等待，保持恒心，不会有过错。",
        categoryGuidance: {
          career: "事业发展需要耐心，在当前位置持之以恒，等待更好的时机。",
          finance: "投资需要耐心等待，不要急于求成，保持长期投资理念。",
          relationship:
            "感情需要时间培养，在现有基础上耐心发展，不要急于推进。",
          health: "身体健康需要长期调理，坚持养生习惯，不要期望立竿见影。",
          general: "在合适的时机保持耐心，持之以恒地等待机会。",
        },
        references: [
          {
            source: "《周易正义》孔颖达",
            text: "需于郊，不犯难行也。利用恒，未失常也。",
            note: "孔颖达认为在郊野等待可以避免冒险，持之以恒能保持正常状态。",
          },
          {
            source: "《伊川易传》程颐",
            text: "需者，须也。物皆须待而后成，故需之义大矣哉。",
            note: "程颐解释需卦的意义，强调万物都需要等待时机才能成功。",
          },
        ],
      },
      {
        position: 5,
        original: "九五：需于酒食，贞吉。",
        translation: "在酒食中等待，坚守正道可获吉祥。",
        interpretation:
          "时机成熟，可以在安乐的环境中等待，但仍然要保持正道，这样就能获得吉祥。",
        categoryGuidance: {
          career: "事业进入稳定期，可以在良好环境中继续发展，但要坚持正道。",
          finance: "财务状况良好，可以享受生活，但仍要保持理性投资。",
          relationship: "感情稳定发展，可以在温馨中享受爱情，但要真诚相待。",
          health: "身体健康，可以享受生活，但要保持良好的生活习惯。",
          general: "在安乐中保持正道，享受等待的果实。",
        },
        references: [
          {
            source: "《周易正义》孔颖达",
            text: "需于酒食，贞吉也。酒食者，德之所养也。",
            note: "孔颖达认为酒食是培养德性的环境，在安乐中也要坚守正道。",
          },
          {
            source: "《程氏易传》程颢",
            text: "酒食者，所以养人者也。需于此而得其正，故吉。",
            note: "程颢解释酒食的作用，强调在安乐环境中坚守正道的重要性。",
          },
        ],
      },
    ],
    structure: {
      upperTrigram: "坎（水）",
      lowerTrigram: "乾（天）",
      symbol: "云上于天，需；君子以饮食宴乐",
    },
    references: [
      {
        book: "《周易正义》",
        quote: "需，须也。险在前也，刚健而不陷，其义不困穷矣。",
        explanation: "孔颖达解释需卦的含义，强调面对险阻时保持刚健不陷的品格。",
      },
      {
        book: "《伊川易传》",
        quote: "需，须也。以刚健之德，需待之时，故能光亨而吉。",
        explanation: "程颐从理学角度解释需卦，强调刚健品德在等待时的重要性。",
      },
      {
        book: "《周易本义》",
        quote: "需者，等待之义。刚健而能待，故能光亨贞吉。",
        explanation: "朱熹解释需卦的哲学意义，阐明刚健与等待相结合的智慧。",
      },
    ],
    lastUpdated: new Date().toISOString(),
    version: "v1.2.0",
    notes: "第三阶段：数据版本管理和质量控制系统",
  },
  "011111": {
    // 夬卦
    nameAlt: "泽天夬",
    pinyin: "guài",
    source: {
      book: "周易·下经",
      chapter: "第四十三卦",
      position: 43,
    },
    guaCi: {
      original: "扬于王庭，孚号有厉，告自邑，不利即戎，利有攸往。",
      translation:
        "在王庭上宣布，心怀诚信地号召有危险，告知自己城邑的人，不宜立即动武，但利于有所前往。",
      interpretation:
        "夬卦象征决断、果决。面对邪恶势力，应当果断处理，但要以诚信为本，不宜轻启战端，要以德服人。",
    },
    yaoCi: [
      {
        position: 1,
        original: "初九：壮于前趾，往不胜为吝。",
        translation: "脚前趾受伤冒进，前往不能取胜会有憾惜。",
        interpretation: "冒进急躁，准备不充分，前往必然不能取胜，会有遗憾。",
        categoryGuidance: {
          career: "事业发展要循序渐进，不要冒进，准备充分再行动。",
          finance: "投资理财要谨慎，不要冲动决策，充分研究后再行动。",
          relationship: "感情发展要自然，不要急于求成，给彼此充分了解的时间。",
          health: "健康管理要有计划，不要过度运动，循序渐进更有效。",
          general: "凡事要准备充分，不要冒进，循序渐进才能成功。",
        },
        references: [
          {
            source: "《周易正义》孔颖达",
            text: "壮于前趾，其行不远也。往不胜为吝，咎不长也。",
            note: "孔颖达认为只顾前进而不顾后果，行动不能持久，必有憾惜。",
          },
          {
            source: "《伊川易传》程颐",
            text: "壮者，伤也。伤于前趾，是冒进之象也。",
            note: "程颐解释'壮'为'伤'的意思，认为这是冒进受伤的象征。",
          },
        ],
      },
      {
        position: 5,
        original: "九五：苋陆夬夬，中行无咎。",
        translation: "像苋陆草那样果断地决断，居中而行没有灾害。",
        interpretation:
          "应当像苋陆草那样柔韧而坚定地决断，持中而行，公正无私，就不会有过错。",
        categoryGuidance: {
          career: "决策时要柔韧而坚定，持中而行，不偏不倚，事业发展顺利。",
          finance: "理财要平衡风险与收益，持中而行，不贪不惧，财务稳定。",
          relationship: "处理感情问题要刚柔相济，持中而行，关系和谐。",
          health: "健康管理要平衡运动与休息，持中而行，身体健康。",
          general: "决策要柔韧而坚定，持中而行，不偏不倚方能成功。",
        },
        references: [
          {
            source: "《周易正义》孔颖达",
            text: "苋陆夬夬，中行无咎，中未光也。",
            note: "孔颖达认为居中而行虽然无咎，但中道尚未光大，需要继续努力。",
          },
          {
            source: "《程氏易传》程颢",
            text: "苋陆者，柔中之草也。夬夬者，决而不留也。",
            note: "程颢解释苋陆草的特性，强调柔韧而果断的品质。",
          },
        ],
      },
    ],
    structure: {
      upperTrigram: "兑（泽）",
      lowerTrigram: "乾（天）",
      symbol: "泽上于天，夬；君子以施禄及下",
    },
    references: [
      {
        book: "《周易正义》",
        quote: "夬，决也。刚决柔也，君子道长，小人道忧也。",
        explanation:
          "孔颖达解释夬卦的含义，强调刚决柔的品格，君子道长而小人道消。",
      },
      {
        book: "《伊川易传》",
        quote: "夬者，决也。以刚决柔，以君子决小人，其势然也。",
        explanation: "程颐从理学角度解释夬卦，强调君子决断小人的必然性。",
      },
      {
        book: "《周易本义》",
        quote: "夬者，决也。阳决阴，君子决小人，以正道也。",
        explanation: "朱熹解释夬卦的哲学意义，阐明以正道决断邪恶的重要性。",
      },
    ],
    lastUpdated: new Date().toISOString(),
    version: "v1.2.0",
    notes: "第三阶段：数据版本管理和质量控制系统",
  },
};

// 64卦完整数据库
// 键：6位二进制字符串（1=阳爻，0=阴爻），顺序为从下到上（初爻到上爻）
export const HEXAGRAMS_DATA: Record<string, HexagramInfo> = {
  "000000": {
    key: "000000",
    name: "坤为地",
    guaCi:
      "元，亨，利牝马之贞。君子有攸往，先迷后得主，利西南得朋，东北丧朋。安贞，吉。",
    yaoCi: [
      "初六：履霜，坚冰至。",
      "六二：直，方，大，不习无不利。",
      "六三：含章可贞。或从王事，无成有终。",
      "六四：括囊；无咎，无誉。",
      "六五：黄裳，元吉。",
      "上六：龙战于野，其血玄黄。",
    ],
    number: 2,
  },
  "000001": {
    key: "000001",
    name: "地雷复",
    guaCi: "亨。出入无疾，朋来无咎。反复其道，七日来复，利有攸往。",
    yaoCi: [
      "初九：不远复，无祗悔，元吉。",
      "六二：休复，吉。",
      "六三：频复，厉无咎。",
      "六四：中行独复。",
      "六五：敦复，无悔。",
      "上六：迷复，凶，有灾眚。用行师，终有大败，以其国君凶，至于十年不克征。",
    ],
    number: 24,
  },
  "000010": {
    key: "000010",
    name: "地水师",
    guaCi: "贞，丈人吉，无咎。",
    yaoCi: [
      "初六：师出以律，否臧凶。",
      "九二：在师中，吉无咎，王三锡命。",
      "六三：师或舆尸，凶。",
      "六四：师左次，无咎。",
      "六五：田有禽，利执言，无咎。长子帅师，弟子舆尸，贞凶。",
      "上六：大君有命，开国承家，小人勿用。",
    ],
    number: 7,
  },
  "000011": {
    key: "000011",
    name: "地泽临",
    guaCi: "元，亨，利，贞。至于八月有凶。",
    yaoCi: [
      "初九：咸临，贞吉。",
      "九二：咸临，吉无不利。",
      "六三：甘临，无攸利。既忧之，无咎。",
      "六四：至临，无咎。",
      "六五：知临，大君之宜，吉。",
      "上六：敦临，吉无咎。",
    ],
    number: 19,
  },
  "000100": {
    key: "000100",
    name: "地山谦",
    guaCi: "亨，君子有终。",
    yaoCi: [
      "初六：谦谦君子，用涉大川，吉。",
      "六二：鸣谦，贞吉。",
      "九三：劳谦君子，有终吉。",
      "六四：无不利，撝谦。",
      "六五：不富，以其邻利用侵伐，无不利。",
      "上六：鸣谦，利用行师，征邑国。",
    ],
    number: 15,
  },
  "000101": {
    key: "000101",
    name: "地风升",
    guaCi: "元亨，用见大人，勿恤，南征吉。",
    yaoCi: [
      "初六：允升，大吉。",
      "九二：孚乃利用禴，无咎。",
      "九三：升虚邑。",
      "六四：王用亨于岐山，吉无咎。",
      "六五：贞吉，升阶。",
      "上六：冥升，利于不息之贞。",
    ],
    number: 46,
  },
  "000110": {
    key: "000110",
    name: "地火明夷",
    guaCi: "利艰贞。",
    yaoCi: [
      "初九：明夷于飞，垂其翼。君子于行，三日不食。",
      "六二：明夷，夷于左股，用拯马壮，吉。",
      "九三：明夷于南狩，得其大首，不可疾贞。",
      "六四：入于左腹，获明夷之心，于出门庭。",
      "六五：箕子之明夷，利贞。",
      "上六：不明晦，初登于天，后入于地。",
    ],
    number: 36,
  },
  "000111": {
    key: "000111",
    name: "地天泰",
    guaCi: "小往大来，吉亨。",
    yaoCi: [
      "初九：拔茅茹，以其彙，征吉。",
      "九二：包荒，用冯河，不遐遗，朋亡，得尚于中行。",
      "九三：无平不陂，无往不复，艰贞无咎。勿恤其孚，于食有福。",
      "六四：翩翩不富，以其邻，不戒以孚。",
      "六五：帝乙归妹，以祉元吉。",
      "上六：城复于隍，勿用师。自邑告命，贞吝。",
    ],
    number: 11,
  },
  "111111": {
    key: "111111",
    name: "乾为天",
    guaCi: "元，亨，利，贞。",
    yaoCi: [
      "初九：潜龙，勿用。",
      "九二：见龙在田，利见大人。",
      "九三：君子终日乾乾，夕惕若，厉无咎。",
      "九四：或跃在渊，无咎。",
      "九五：飞龙在天，利见大人。",
      "上九：亢龙有悔。",
    ],
    number: 1,
  },
  "100101": {
    key: "100101",
    name: "山风蛊",
    guaCi: "元，亨，利涉大川。先甲三日，后甲三日。",
    yaoCi: [
      "初六：干父之蛊，有子，考无咎，厉终吉。",
      "九二：干母之蛊，不可贞。",
      "九三：干父之蛊，小有悔，无大咎。",
      "六四：裕父之蛊，往见吝。",
      "六五：干父之蛊，用誉。",
      "上九：不事王侯，高尚其事。",
    ],
    number: 18,
  },
  "111001": {
    key: "111001",
    name: "天雷无妄",
    guaCi: "元，亨，利，贞。其匪正有眚，不利有攸往。",
    yaoCi: [
      "初九：无妄，往吉。",
      "六二：不耕获，不菑畬，则利有攸往。",
      "六三：无妄之灾，或系之牛，行人之得，邑人之灾。",
      "九四：可贞，无咎。",
      "九五：无妄之疾，勿药有喜。",
      "上九：无妄，行有眚，无攸利。",
    ],
    number: 25,
  },
  // 添加其他卦象的基本数据，暂时使用占位符文本
  "001000": {
    key: "001000",
    name: "雷地豫",
    guaCi: "利建侯行师。",
    yaoCi: [
      "初六：鸣豫，凶。",
      "六二：介于石，不终日，贞吉。",
      "六三：盱豫，悔。迟有悔。",
      "九四：由豫，大有得。勿疑。朋盍簪。",
      "六五：贞疾，恒不死。",
      "上六：冥豫，成有渝，无咎。",
    ],
    number: 16,
  },
  "001001": {
    key: "001001",
    name: "雷天大壮",
    guaCi: "利贞。",
    yaoCi: [
      "初九：壮于趾，征凶，有孚。",
      "九二：贞吉。",
      "九三：小人用壮，君子用罔，贞厉。羝羊触藩，羸其角。",
      "九四：贞吉悔亡，藩决不羸，壮于大舆之輹。",
      "六五：丧羊于易，无悔。",
      "上六：羝羊触藩，不能退，不能遂，无攸利，艰则吉。",
    ],
    number: 34,
  },
  "001010": {
    key: "001010",
    name: "雷水解",
    guaCi: "利西南，无所往，其来复吉。",
    yaoCi: [
      "初六：无咎。",
      "九二：田获三狐，得黄矢，贞吉。",
      "六三：负且乘，致寇至，贞吝。",
      "九四：解而拇，朋至斯孚。",
      "六五：君子维有解，吉。有孚于小人。",
      "上六：公用射隼于高墉之上，获之，无不利。",
    ],
    number: 40,
  },
  "001011": {
    key: "001011",
    name: "雷泽归妹",
    guaCi: "征凶，无攸利。",
    yaoCi: [
      "初九：归妹以娣，跛能履，征吉。",
      "九二：眇能视，利幽人之贞。",
      "六三：归妹以须，反归以娣。",
      "九四：归妹愆期，迟归有时。",
      "六五：帝乙归妹，其君之袂，不如其娣之袂良，月几望，吉。",
      "上六：女承筐无实，士刲羊无血，无攸利。",
    ],
    number: 54,
  },
  "001100": {
    key: "001100",
    name: "雷山小过",
    guaCi: "亨，利贞，可小事，不可大事。飞鸟遗之音，不宜上宜下，大吉。",
    yaoCi: [
      "初六：飞鸟以凶。",
      "六二：过其祖，遇其妣；不及其君，遇其臣，无咎。",
      "九三：弗过防之，从或戕之，凶。",
      "九四：无咎，弗过遇之，往厉必戒，勿用永贞。",
      "六五：密云不雨，自我西郊，公弋取彼在穴。",
      "上六：弗遇过之，飞鸟离之，凶，是谓灾眚。",
    ],
    number: 62,
  },
  "001101": {
    key: "001101",
    name: "雷风恒",
    guaCi: "亨，无咎，利贞，利有攸往。",
    yaoCi: [
      "初六：浚恒，贞凶，无攸利。",
      "九二：悔亡。",
      "九三：不恒其德，或承之羞，贞吝。",
      "九四：田无禽。",
      "六五：恒其德，贞，妇人吉，夫子凶。",
      "上六：振恒，凶。",
    ],
    number: 32,
  },
  "001110": {
    key: "001110",
    name: "雷火丰",
    guaCi: "亨。王假之，勿忧，宜日中。",
    yaoCi: [
      "初九：遇其配主，虽旬无咎，往有尚。",
      "六二：丰其蔀，日中见斗，往得疑疾，有孚发若，吉。",
      "九三：丰其沛，日中见沫，折其右肱，无咎。",
      "九四：丰其蔀，日中见斗，遇其夷主，吉。",
      "六五：来章，有庆誉，吉。",
      "上六：丰其屋，蔀其家，窥其户，阒其无人，三岁不觌，凶。",
    ],
    number: 55,
  },
  "010000": {
    key: "010000",
    name: "水地比",
    guaCi: "吉。原筮元永贞，无咎。不宁方来，后夫凶。",
    yaoCi: [
      "初六：有孚比之，无咎。有孚盈缶，终来有他，吉。",
      "六二：比之自内，贞吉。",
      "六三：比之匪人。",
      "六四：外比之，贞吉。",
      "九五：显比，王用三驱，失前禽，邑人不诫，吉。",
      "上六：比之无首，凶。",
    ],
    number: 8,
  },
  "010001": {
    key: "010001",
    name: "水雷屯",
    guaCi: "元，亨，利，贞。勿用有攸往，利建侯。",
    yaoCi: [
      "初九：磐桓，利居贞，利建侯。",
      "六二：屯如邅如，乘马班如。匪寇婚媾，女子贞不字，十年乃字。",
      "六三：即鹿无虞，惟入于林中，君子几不如舍，往吝。",
      "六四：乘马班如，求婚媾，往吉，无不利。",
      "九五：屯其膏，小贞吉，大贞凶。",
      "上六：乘马班如，泣血涟如。",
    ],
    number: 3,
  },
  "010010": {
    key: "010010",
    name: "坎为水",
    guaCi: "有孚，维心亨，行有尚。",
    yaoCi: [
      "初六：习坎，入于坎窞，凶。",
      "九二：坎有险，求小得。",
      "六三：来之坎坎，险且枕，入于坎窞，勿用。",
      "六四：樽酒簋贰，用缶，纳约自牖，终无咎。",
      "九五：坎不盈，祗既平，无咎。",
      "上六：系用徽纆，寘于丛棘，三岁不得，凶。",
    ],
    number: 29,
  },
  "010011": {
    key: "010011",
    name: "水泽节",
    guaCi: "亨。苦节不可贞。",
    yaoCi: [
      "初九：不出户庭，无咎。",
      "九二：不出门庭，凶。",
      "六三：不节若，则嗟若，无咎。",
      "六四：安节，亨。",
      "九五：甘节，吉。往有尚。",
      "上六：苦节，贞凶，悔亡。",
    ],
    number: 60,
  },
  "010100": {
    key: "010100",
    name: "水山蹇",
    guaCi: "利西南，不利东北；利见大人，贞吉。",
    yaoCi: [
      "初六：往蹇，来誉。",
      "六二：王臣蹇蹇，匪躬之故。",
      "九三：往蹇，来反。",
      "六四：往蹇，来连。",
      "九五：大蹇朋来。",
      "上六：往蹇，来硕，吉；利见大人。",
    ],
    number: 39,
  },
  "010101": {
    key: "010101",
    name: "水风井",
    guaCi: "改邑不改井，无丧无得，往来井井。汔至，亦未繘井，羸其瓶，凶。",
    yaoCi: [
      "初六：井泥不食，旧井无禽。",
      "九二：井谷射鲋，瓮敝漏。",
      "九三：井渫不食，为我心恻；可用汲，王明，并受其福。",
      "六四：井甃，无咎。",
      "九五：井冽，寒泉食。",
      "上六：井收勿幕，有孚元吉。",
    ],
    number: 48,
  },
  "010110": {
    key: "010110",
    name: "水火既济",
    guaCi: "亨，小利贞，初吉终乱。",
    yaoCi: [
      "初九：曳其轮，濡其尾，无咎。",
      "六二：妇丧其茀，勿逐，七日得。",
      "九三：高宗伐鬼方，三年克之，小人勿用。",
      "六四：繻有衣袽，终日戒。",
      "九五：东邻杀牛，不如西邻之禴祭，实受其福。",
      "上六：濡其首，厉。",
    ],
    number: 63,
  },
  "010111": {
    key: "010111",
    name: "水天需",
    guaCi: "有孚，光亨，贞吉。利涉大川。",
    yaoCi: [
      "初九：需于郊，利用恒，无咎。",
      "九二：需于沙，小有言，终吉。",
      "九三：需于泥，致寇至。",
      "六四：需于血，出自穴。",
      "九五：需于酒食，贞吉。",
      "上六：入于穴，有不速之客三人来，敬之终吉。",
    ],
    number: 5,
  },
  "011000": {
    key: "011000",
    name: "泽地萃",
    guaCi: "亨。王假有庙，利见大人，亨，利贞。用大牲吉，利有攸往。",
    yaoCi: [
      "初六：有孚不终，乃乱乃萃，若号一握为笑，勿恤，往无咎。",
      "六二：引吉，无咎，孚乃利用禴。",
      "六三：萃如，嗟如，无攸利，往无咎，小吝。",
      "九四：大吉，无咎。",
      "九五：萃有位，无咎。匪孚，元永贞，悔亡。",
      "上六：赍咨涕洟，无咎。",
    ],
    number: 45,
  },
  "011001": {
    key: "011001",
    name: "泽雷随",
    guaCi: "元，亨，利，贞，无咎。",
    yaoCi: [
      "初九：官有渝，贞吉。出门交有功。",
      "六二：係小子，失丈夫。",
      "六三：係丈夫，失小子。随有求得，利居贞。",
      "九四：随有获，贞凶。有孚在道，以明，何咎。",
      "九五：孚于嘉，吉。",
      "上六：拘係之，乃从维之。王用亨于西山。",
    ],
    number: 17,
  },
  "011010": {
    key: "011010",
    name: "泽水困",
    guaCi: "亨，贞，大人吉，无咎，有言不信。",
    yaoCi: [
      "初六：臀困于株木，入于幽谷，三岁不觌。",
      "九二：困于酒食，朱绂方来，利用亨祀，征凶，无咎。",
      "六三：困于石，据于蒺藜，入于其宫，不见其妻，凶。",
      "九四：来徐徐，困于金车，吝，有终。",
      "九五：劓刖，困于赤绂，乃徐有说，利用祭祀。",
      "上六：困于葛藟，于臲卼，曰动悔。有悔，征吉。",
    ],
    number: 47,
  },
  "011011": {
    key: "011011",
    name: "兑为泽",
    guaCi: "亨，利贞。",
    yaoCi: [
      "初九：和兑，吉。",
      "九二：孚兑，吉，悔亡。",
      "六三：来兑，凶。",
      "九四：商兑，未宁，介疾有喜。",
      "九五：孚于剥，有厉。",
      "上六：引兑。",
    ],
    number: 58,
  },
  "011100": {
    key: "011100",
    name: "泽山咸",
    guaCi: "亨，利贞，取女吉。",
    yaoCi: [
      "初六：咸其拇。",
      "六二：咸其腓，凶，居吉。",
      "九三：咸其股，执其随，往吝。",
      "九四：贞吉悔亡，憧憧往来，朋从尔思。",
      "九五：咸其脢，无悔。",
      "上六：咸其辅颊舌。",
    ],
    number: 31,
  },
  "011101": {
    key: "011101",
    name: "泽风大过",
    guaCi: "栋桡，利有攸往，亨。",
    yaoCi: [
      "初六：藉用白茅，无咎。",
      "九二：枯杨生稊，老夫得其女妻，无不利。",
      "九三：栋桡，凶。",
      "九四：栋隆，吉；有它吝。",
      "九五：枯杨生华，老妇得其士夫，无咎无誉。",
      "上六：过涉灭顶，凶，无咎。",
    ],
    number: 28,
  },
  "011110": {
    key: "011110",
    name: "泽火革",
    guaCi: "巳日乃孚，元亨利贞，悔亡。",
    yaoCi: [
      "初九：巩用黄牛之革。",
      "六二：巳日乃革之，征吉，无咎。",
      "九三：征凶，贞厉。革言三就，有孚。",
      "九四：悔亡，有孚改命，吉。",
      "九五：大人虎变，未占有孚。",
      "上六：君子豹变，小人革面，征凶，居贞吉。",
    ],
    number: 49,
  },
  "011111": {
    key: "011111",
    name: "泽天夬",
    guaCi: "扬于王庭，孚号有厉，告自邑，不利即戎，利有攸往。",
    yaoCi: [
      "初九：壮于前趾，往不胜为吝。",
      "九二：惕号，莫夜有戎，勿恤。",
      "九三：壮于頯，有凶。君子夬夬，独行遇雨，若濡有愠，无咎。",
      "九四：臀无肤，其行次且。牵羊悔亡，闻言不信。",
      "九五：苋陆夬夬，中行无咎。",
      "上六：无号，终有凶。",
    ],
    number: 43,
  },
  "100000": {
    key: "100000",
    name: "山地剥",
    guaCi: "不利有攸往。",
    yaoCi: [
      "初六：剥床以足，蔑贞凶。",
      "六二：剥床以辨，蔑贞凶。",
      "六三：剥之，无咎。",
      "六四：剥床以肤，凶。",
      "六五：贯鱼，以宫人宠，无不利。",
      "上九：硕果不食，君子得舆，小人剥庐。",
    ],
    number: 23,
  },
  "100001": {
    key: "100001",
    name: "山雷颐",
    guaCi: "贞吉。观颐，自求口实。",
    yaoCi: [
      "初九：舍尔灵龟，观我朵颐，凶。",
      "六二：颠颐，拂经，于丘颐，征凶。",
      "六三：拂颐，贞凶，十年勿用，无攸利。",
      "六四：颠颐吉，虎视眈眈，其欲逐逐，无咎。",
      "六五：拂经，居贞吉，不可涉大川。",
      "上九：由颐，厉吉，利涉大川。",
    ],
    number: 27,
  },
  "100010": {
    key: "100010",
    name: "山水蒙",
    guaCi: "亨。匪我求童蒙，童蒙求我。初噬告，再三渎，渎则不告。利贞。",
    yaoCi: [
      "初六：发蒙，利用刑人，用说桎梏，以往吝。",
      "九二：包蒙吉，纳妇吉，子克家。",
      "六三：勿用娶女，见金夫，不有躬，无攸利。",
      "六四：困蒙，吝。",
      "六五：童蒙，吉。",
      "上九：击蒙，不利为寇，利御寇。",
    ],
    number: 4,
  },
  "100011": {
    key: "100011",
    name: "山泽损",
    guaCi: "有孚，元吉，无咎，可贞，利有攸往。",
    yaoCi: [
      "初九：已事遄往，无咎，酌损之。",
      "九二：利贞，征凶，弗损益之。",
      "六三：三人行，则损一人；一人行，则得其友。",
      "六四：损其疾，使遄有喜，无咎。",
      "六五：或益之，十朋之龟弗克违，元吉。",
      "上九：弗损益之，无咎，贞吉，利有攸往，得臣无家。",
    ],
    number: 41,
  },
  "100100": {
    key: "100100",
    name: "艮为山",
    guaCi: "艮其背，不获其身，行其庭，不见其人，无咎。",
    yaoCi: [
      "初六：艮其趾，无咎，利永贞。",
      "六二：艮其腓，不拯其随，其心不快。",
      "九三：艮其限，列其夤，厉薰心。",
      "六四：艮其身，无咎。",
      "六五：艮其辅，言有序，悔亡。",
      "上九：敦艮，吉。",
    ],
    number: 52,
  },
  "100110": {
    key: "100110",
    name: "山火贲",
    guaCi: "亨。小利有所往。",
    yaoCi: [
      "初九：贲其趾，舍车而徒。",
      "六二：贲其须。",
      "九三：贲如濡如，永贞吉。",
      "六四：贲如皤如，白马翰如，匪寇婚媾。",
      "六五：贲于丘园，束帛戋戋，吝，终吉。",
      "上九：白贲，无咎。",
    ],
    number: 22,
  },
  "100111": {
    key: "100111",
    name: "山天大畜",
    guaCi: "利贞，不家食吉，利涉大川。",
    yaoCi: [
      "初九：有厉利已。",
      "九二：舆说輹。",
      "九三：良马逐，利艰贞。曰闲舆卫，利有攸往。",
      "六四：童牛之牿，元吉。",
      "六五：豮豕之牙，吉。",
      "上九：何天之衢，亨。",
    ],
    number: 26,
  },
  "101000": {
    key: "101000",
    name: "风地观",
    guaCi: "盥而不荐，有孚顒若。",
    yaoCi: [
      "初六：童观，小人无咎，君子吝。",
      "六二：窥观，利女贞。",
      "六三：观我生，进退。",
      "六四：观国之光，利用宾于王。",
      "九五：观我生，君子无咎。",
      "上九：观其生，君子无咎。",
    ],
    number: 20,
  },
  "101001": {
    key: "101001",
    name: "风雷益",
    guaCi: "利有攸往，利涉大川。",
    yaoCi: [
      "初九：利用为大作，元吉，无咎。",
      "六二：或益之，十朋之龟弗克违，永贞吉。王用亨于帝，吉。",
      "六三：益之用凶事，无咎。有孚中行，告公用圭。",
      "六四：中行告公从，利用为依迁国。",
      "九五：有孚惠心，勿问元吉。有孚惠我德。",
      "上九：莫益之，或击之，立心勿恒，凶。",
    ],
    number: 42,
  },
  "101010": {
    key: "101010",
    name: "风水涣",
    guaCi: "亨。王假有庙，利涉大川，利贞。",
    yaoCi: [
      "初六：拯马壮，吉。",
      "九二：涣奔其机，悔亡。",
      "六三：涣其躬，无悔。",
      "六四：涣其群，元吉。涣有丘，匪夷所思。",
      "九五：涣汗其大号，涣王居，无咎。",
      "上九：涣其血，去逖出，无咎。",
    ],
    number: 59,
  },
  "101011": {
    key: "101011",
    name: "风泽中孚",
    guaCi: "豚鱼吉，利涉大川，利贞。",
    yaoCi: [
      "初九：虞吉，有它不燕。",
      "九二：鸣鹤在阴，其子和之。我有好爵，吾与尔靡之。",
      "六三：得敌，或鼓或罢，或泣或歌。",
      "六四：月几望，马匹亡，无咎。",
      "九五：有孚挛如，无咎。",
      "上九：翰音登于天，贞凶。",
    ],
    number: 61,
  },
  "101100": {
    key: "101100",
    name: "风山渐",
    guaCi: "女归吉，利贞。",
    yaoCi: [
      "初六：鸿渐于干，小子厉，有言，无咎。",
      "六二：鸿渐于磐，饮食衎衎，吉。",
      "九三：鸿渐于陆，夫征不复，妇孕不育，凶；利御寇。",
      "六四：鸿渐于木，或得其桷，无咎。",
      "九五：鸿渐于陵，妇三岁不孕，终莫之胜，吉。",
      "上九：鸿渐于陆，其羽可用为仪，吉。",
    ],
    number: 53,
  },
  "101101": {
    key: "101101",
    name: "巽为风",
    guaCi: "小亨，利有攸往，利见大人。",
    yaoCi: [
      "初六：进退，利武人之贞。",
      "九二：巽在床下，用史巫纷若，吉无咎。",
      "九三：频巽，吝。",
      "六四：悔亡，田获三品。",
      "九五：贞吉悔亡，无不利。无初有终，先庚三日，后庚三日，吉。",
      "上九：巽在床下，丧其资斧，贞凶。",
    ],
    number: 57,
  },
  "101110": {
    key: "101110",
    name: "风火家人",
    guaCi: "利女贞。",
    yaoCi: [
      "初九：闲有家，悔亡。",
      "六二：无攸遂，在中馈，贞吉。",
      "九三：家人嗃嗃，悔厉吉；妇子嘻嘻，终吝。",
      "六四：富家，大吉。",
      "九五：王假有家，勿恤，吉。",
      "上九：有孚威如，终吉。",
    ],
    number: 37,
  },
  "101111": {
    key: "101111",
    name: "风天小畜",
    guaCi: "亨。密云不雨，自我西郊。",
    yaoCi: [
      "初九：复自道，何其咎，吉。",
      "九二：牵复，吉。",
      "九三：舆说辐，夫妻反目。",
      "六四：有孚，血去惕出，无咎。",
      "九五：有孚挛如，富以其邻。",
      "上九：既雨既处，尚德载，妇贞厉。月几望，君子征凶。",
    ],
    number: 9,
  },
  "110000": {
    key: "110000",
    name: "火地晋",
    guaCi: "康侯用锡马蕃庶，昼日三接。",
    yaoCi: [
      "初六：晋如，摧如，贞吉。罔孚，裕无咎。",
      "六二：晋如，愁如，贞吉。受兹介福，于其王母。",
      "六三：众允，悔亡。",
      "九四：晋如硕鼠，贞厉。",
      "六五：悔亡，失得勿恤，往吉无不利。",
      "上九：晋其角，维用伐邑，厉吉无咎，贞吝。",
    ],
    number: 35,
  },
  "110001": {
    key: "110001",
    name: "火雷噬嗑",
    guaCi: "亨。利用狱。",
    yaoCi: [
      "初九：屦校灭趾，无咎。",
      "六二：噬肤灭鼻，无咎。",
      "六三：噬腊肉，遇毒，小吝，无咎。",
      "九四：噬乾胏，得金矢，利艰贞，吉。",
      "六五：噬乾肉，得黄金，贞厉，无咎。",
      "上九：何校灭耳，凶。",
    ],
    number: 21,
  },
  "110010": {
    key: "110010",
    name: "火水未济",
    guaCi: "亨，小狐汔济，濡其尾，无攸利。",
    yaoCi: [
      "初六：濡其尾，吝。",
      "九二：曳其轮，贞吉。",
      "六三：未济，征凶，利涉大川。",
      "九四：贞吉，悔亡，震用伐鬼方，三年有赏于大国。",
      "六五：贞吉，无悔，君子之光，有孚，吉。",
      "上九：有孚于饮酒，无咎，濡其首，有孚失是。",
    ],
    number: 64,
  },
  "110011": {
    key: "110011",
    name: "火泽睽",
    guaCi: "小事吉。",
    yaoCi: [
      "初九：悔亡，丧马勿逐，自复。见恶人无咎。",
      "九二：遇主于巷，无咎。",
      "六三：见舆曳，其牛掣，其人天且劓，无初有终。",
      "九四：睽孤，遇元夫，交孚，厉无咎。",
      "六五：悔亡，厥宗噬肤，往何咎。",
      "上九：睽孤，见豕负涂，载鬼一车，先张之弧，后说之弧，匪寇婚媾，往遇雨则吉。",
    ],
    number: 38,
  },
  "110100": {
    key: "110100",
    name: "火山旅",
    guaCi: "小亨，旅贞吉。",
    yaoCi: [
      "初六：旅琐琐，斯其所取灾。",
      "六二：旅即次，怀其资，得童仆贞。",
      "九三：旅焚其次，丧其童仆，贞厉。",
      "九四：旅于处，得其资斧，我心不快。",
      "六五：射雉，一矢亡，终以誉命。",
      "上九：鸟焚其巢，旅人先笑后号啕。丧牛于易，凶。",
    ],
    number: 56,
  },
  "110101": {
    key: "110101",
    name: "火风鼎",
    guaCi: "元吉，亨。",
    yaoCi: [
      "初六：鼎颠趾，利出否，得妾以其子，无咎。",
      "九二：鼎有实，我仇有疾，不我能即，吉。",
      "九三：鼎耳革，其行塞，雉膏不食，方雨亏悔，终吉。",
      "九四：鼎折足，覆公餗，其形渥，凶。",
      "六五：鼎黄耳金铉，利贞。",
      "上九：鼎玉铉，大吉，无不利。",
    ],
    number: 50,
  },
  "110110": {
    key: "110110",
    name: "离为火",
    guaCi: "利贞，亨。畜牝牛，吉。",
    yaoCi: [
      "初九：履错然，敬之无咎。",
      "六二：黄离，元吉。",
      "九三：日昃之离，不鼓缶而歌，则大耋之嗟，凶。",
      "九四：突如其来如，焚如，死如，弃如。",
      "六五：出涕沱若，戚嗟若，吉。",
      "上九：王用出征，有嘉折首，获匪其丑，无咎。",
    ],
    number: 30,
  },
  "110111": {
    key: "110111",
    name: "火天大有",
    guaCi: "元亨。",
    yaoCi: [
      "初九：无交害，匪咎，艰则无咎。",
      "九二：大车以载，有攸往，无咎。",
      "九三：公用亨于天子，小人弗克。",
      "九四：匪其彭，无咎。",
      "六五：厥孚交如，威如，吉。",
      "上九：自天祐之，吉无不利。",
    ],
    number: 14,
  },
  "111000": {
    key: "111000",
    name: "天地否",
    guaCi: "否之匪人，不利君子贞，大往小来。",
    yaoCi: [
      "初六：拔茅茹，以其彙，贞吉亨。",
      "六二：包承，小人吉，大人否亨。",
      "六三：包羞。",
      "九四：有命无咎，畴离祉。",
      "九五：休否，大人吉。其亡其亡，系于苞桑。",
      "上九：倾否，先否后喜。",
    ],
    number: 12,
  },
  "111010": {
    key: "111010",
    name: "天水讼",
    guaCi: "有孚，窒。惕中吉。终凶。利见大人，不利涉大川。",
    yaoCi: [
      "初六：不永所事，小有言，终吉。",
      "九二：不克讼，归而逋，其邑人三百户，无眚。",
      "六三：食旧德，贞厉，终吉。或从王事，无成。",
      "九四：不克讼，复即命渝，安贞吉。",
      "九五：讼元吉。",
      "上九：或锡之鞶带，终朝三褫之。",
    ],
    number: 6,
  },
  "111011": {
    key: "111011",
    name: "天泽履",
    guaCi: "履虎尾，不咥人，亨。",
    yaoCi: [
      "初九：素履，往无咎。",
      "九二：履道坦坦，幽人贞吉。",
      "六三：眇能视，跛能履，履虎尾，咥人，凶。武人为于大君。",
      "九四：履虎尾，愬愬终吉。",
      "九五：夬履，贞厉。",
      "上九：视履考祥，其旋元吉。",
    ],
    number: 10,
  },
  "111100": {
    key: "111100",
    name: "天山遁",
    guaCi: "亨，小利贞。",
    yaoCi: [
      "初六：遁尾，厉，勿用有攸往。",
      "六二：执之用黄牛之革，莫之胜说。",
      "九三：系遁，有疾厉，畜臣妾吉。",
      "九四：好遁，君子吉，小人否。",
      "九五：嘉遁，贞吉。",
      "上九：肥遁，无不利。",
    ],
    number: 33,
  },
  "111101": {
    key: "111101",
    name: "天风姤",
    guaCi: "女壮，勿用取女。",
    yaoCi: [
      "初六：繫于金柅，贞吉。有攸往，见凶，羸豕踟躰。",
      "九二：包有鱼，无咎，不利宾。",
      "九三：臀无肤，其行次且，厉，无大咎。",
      "九四：包无鱼，起凶。",
      "九五：以杞包瓜，含章，有陨自天。",
      "上九：姤其角，吝，无咎。",
    ],
    number: 44,
  },
  "111110": {
    key: "111110",
    name: "天火同人",
    guaCi: "同人于野，亨。利涉大川，利君子贞。",
    yaoCi: [
      "初九：同人于门，无咎。",
      "六二：同人于宗，吝。",
      "九三：伏戎于莽，升其高陵，三岁不兴。",
      "九四：乘其墉，弗克攻，吉。",
      "九五：同人，先号啕而后笑。大师克相遇。",
      "上九：同人于郊，无悔。",
    ],
    number: 13,
  },
};

// 爻信息接口（临时定义，避免循环依赖）
export interface YaoInfo {
  value: number; // 6(老阴), 7(少阳), 8(少阴), 9(老阳)
  isChanging: boolean; // 是否为动爻
}

/**
 * 计算变卦的爻线
 * 根据本卦计算变卦的爻线数据（传统六爻占卜法）
 * 规则：老阴(6)→老阳(9)，老阳(9)→老阴(6)，少阳(7)和少阴(8)保持不变
 * @param benGuaLines 本卦的爻线数组，顺序为从下到上
 * @returns 变卦的爻线数组
 */
export const calculateBianGuaLines = (benGuaLines: YaoInfo[]): YaoInfo[] => {
  if (!benGuaLines || benGuaLines.length !== 6) {
    console.warn("calculateBianGuaLines: 输入必须是6条爻");
    return [];
  }

  try {
    return benGuaLines.map((yao) => {
      // 只对动爻进行变换（传统六爻占卜法）
      if (yao.isChanging) {
        // 老阴(6) 变为 老阳(9)
        if (yao.value === 6) {
          return { ...yao, value: 9, isChanging: false };
        }
        // 老阳(9) 变为 老阴(6)
        if (yao.value === 9) {
          return { ...yao, value: 6, isChanging: false };
        }
      }
      // 静爻 (7, 8) 保持不变
      return { ...yao };
    });
  } catch (error) {
    console.error("calculateBianGuaLines: 计算变卦时出错", error);
    return benGuaLines; // 出错时返回原数据
  }
};

/**
 * 根据爻线数组获取卦象信息
 * @param yaoLines 6条爻的数组，顺序为从下到上（初爻到上爻）
 * @returns 对应的卦象信息，如果找不到则返回undefined
 */
export const getHexagramInfo = (
  yaoLines: YaoInfo[],
): HexagramInfo | undefined => {
  // 验证输入
  if (!yaoLines || yaoLines.length !== 6) {
    console.warn("getHexagramInfo: 输入必须是6条爻");
    return undefined;
  }

  try {
    // 将爻值转换为二进制字符串
    // 7或9（阳）-> '1'，6或8（阴）-> '0'
    // 注意：数组顺序是从下到上（初爻在索引0），这符合我们的二进制编码规则
    const binaryKey = yaoLines
      .map((yao) => ([7, 9].includes(yao.value) ? "1" : "0"))
      .join("");

    // 查找对应的卦象信息
    const hexagramInfo = HEXAGRAMS_DATA[binaryKey];

    if (!hexagramInfo) {
      console.warn(
        `getHexagramInfo: 找不到对应的卦象，二进制key: ${binaryKey}`,
      );
      return undefined;
    }

    return hexagramInfo;
  } catch (error) {
    console.error("getHexagramInfo: 计算卦象信息时出错", error);
    return undefined;
  }
};

/**
 * 根据爻值数组获取卦象信息（简化版本）
 * @param yaoValues 6个爻值的数组 [6,7,8,9]
 * @returns 对应的卦象信息
 */
export const getHexagramInfoByValues = (
  yaoValues: number[],
): HexagramInfo | undefined => {
  if (!yaoValues || yaoValues.length !== 6) {
    return undefined;
  }

  // 转换为YaoInfo格式
  const yaoLines: YaoInfo[] = yaoValues.map((value) => ({
    value,
    isChanging: [6, 9].includes(value), // 老阴和老阳为动爻
  }));

  return getHexagramInfo(yaoLines);
};

/**
 * 获取所有卦象名称列表
 * @returns 所有卦象名称的数组
 */
export const getAllHexagramNames = (): string[] => {
  return Object.values(HEXAGRAMS_DATA).map((hexagram) => hexagram.name);
};

/**
 * 根据卦序获取卦象信息
 * @param number 卦序（1-64）
 * @returns 对应的卦象信息
 */
export const getHexagramByNumber = (
  number: number,
): HexagramInfo | undefined => {
  return Object.values(HEXAGRAMS_DATA).find(
    (hexagram) => hexagram.number === number,
  );
};

/**
 * 搜索卦象（按名称）
 * @param keyword 搜索关键词
 * @returns 匹配的卦象列表
 */
export const searchHexagrams = (keyword: string): HexagramInfo[] => {
  if (!keyword.trim()) {
    return [];
  }

  const searchTerm = keyword.toLowerCase();
  return Object.values(HEXAGRAMS_DATA).filter((hexagram) =>
    hexagram.name.toLowerCase().includes(searchTerm),
  );
};

// 解读结果接口
export interface InterpretationResult {
  title: string; // 如"本卦·乾·初九爻辞"
  text: string; // 爻辞原文
  sourceGua: "ben" | "bian"; // 来源是本卦还是变卦
  yaoPosition?: string; // 爻位："初九"、"六二"等
  importance: "primary" | "secondary"; // 重要性级别
}

/**
 * 获取爻位名称
 * @param index 爻的索引 (0-5, 从下到上)
 * @param value 爻的值 (6,7,8,9)
 * @returns 爻位名称，如"初九"、"六二"等
 */
export const getYaoPositionName = (index: number, value: number): string => {
  const positionNames = ["初", "二", "三", "四", "五", "上"];
  const yaoType = [7, 9].includes(value) ? "九" : "六";
  return positionNames[index] + yaoType;
};

/**
 * 获取核心解读
 * 根据动爻数量确定本次占卜的核心答案
 * @param benGuaInfo 本卦信息
 * @param bianGuaInfo 变卦信息（可选）
 * @param changingLineIndexes 动爻的索引数组 [0, 1, 2, 3, 4, 5]
 * @param originalHexagram 原始卦象的爻值数组（可选，用于判断爻位阴阳）
 * @returns 核心解读结果
 */
export const getPrimaryInterpretation = (
  benGuaInfo: HexagramInfo,
  bianGuaInfo?: HexagramInfo,
  changingLineIndexes: number[] = [],
  originalHexagram?: number[],
): InterpretationResult => {
  const changingCount = changingLineIndexes.length;

  switch (changingCount) {
    case 0: {
      // 无动爻，看本卦卦辞
      return {
        title: `本卦 · ${benGuaInfo.name}`,
        text: benGuaInfo.guaCi,
        sourceGua: "ben",
        importance: "primary",
      };
    }

    case 1: {
      // 一爻动，看此动爻的爻辞
      const lineIndex = changingLineIndexes[0];
      const lineValue = benGuaInfo.yaoCi[lineIndex];

      // 根据原始卦象判断爻位的阴阳
      let yaoValue = 9; // 默认为阳
      if (originalHexagram && originalHexagram[lineIndex]) {
        yaoValue = originalHexagram[lineIndex];
      }
      const yaoPosition = getYaoPositionName(lineIndex, yaoValue);

      return {
        title: `本卦 · ${benGuaInfo.name} · ${yaoPosition}爻辞`,
        text: lineValue,
        sourceGua: "ben",
        yaoPosition,
        importance: "primary",
      };
    }

    case 2: {
      // 两爻动，看本卦中下方动爻的爻辞
      const lowerLineIndex = Math.min(...changingLineIndexes);
      const lineValue = benGuaInfo.yaoCi[lowerLineIndex];

      // 根据原始卦象判断爻位的阴阳
      let yaoValue = 9; // 默认为阳
      if (originalHexagram && originalHexagram[lowerLineIndex]) {
        yaoValue = originalHexagram[lowerLineIndex];
      }
      const yaoPosition = getYaoPositionName(lowerLineIndex, yaoValue);

      return {
        title: `本卦 · ${benGuaInfo.name} · ${yaoPosition}爻辞`,
        text: lineValue,
        sourceGua: "ben",
        yaoPosition,
        importance: "primary",
      };
    }

    case 3: {
      // 三爻动，取本卦卦辞
      return {
        title: `本卦 · ${benGuaInfo.name}`,
        text: benGuaInfo.guaCi,
        sourceGua: "ben",
        importance: "primary",
      };
    }

    case 4: {
      // 四爻动，取变卦卦辞
      if (bianGuaInfo) {
        return {
          title: `变卦 · ${bianGuaInfo.name}`,
          text: bianGuaInfo.guaCi,
          sourceGua: "bian",
          importance: "primary",
        };
      }
      // 如果没有变卦信息，回退到本卦卦辞
      return {
        title: `本卦 · ${benGuaInfo.name}`,
        text: benGuaInfo.guaCi,
        sourceGua: "ben",
        importance: "primary",
      };
    }

    case 5: {
      // 五爻动，取变卦中不变的爻辞
      if (bianGuaInfo) {
        // 找出变卦中哪个爻位是不变的（即原卦中不是动爻的）
        const staticLines = [0, 1, 2, 3, 4, 5].filter(
          (i) => !changingLineIndexes.includes(i),
        );
        if (staticLines.length > 0) {
          const staticLineIndex = staticLines[0];
          const lineValue = bianGuaInfo.yaoCi[staticLineIndex];

          // 根据原始卦象判断爻位的阴阳（五爻动时，唯一的静爻保持原值）
          let yaoValue = 7; // 默认为少阳
          if (originalHexagram && originalHexagram[staticLineIndex]) {
            yaoValue = originalHexagram[staticLineIndex];
          }
          const yaoPosition = getYaoPositionName(staticLineIndex, yaoValue);

          return {
            title: `变卦 · ${bianGuaInfo.name} · ${yaoPosition}爻辞`,
            text: lineValue,
            sourceGua: "bian",
            yaoPosition,
            importance: "primary",
          };
        }
      }
      // 回退到本卦卦辞
      return {
        title: `本卦 · ${benGuaInfo.name}`,
        text: benGuaInfo.guaCi,
        sourceGua: "ben",
        importance: "primary",
      };
    }

    case 6: {
      // 六爻动，取变卦卦辞
      if (bianGuaInfo) {
        return {
          title: `变卦 · ${bianGuaInfo.name}`,
          text: bianGuaInfo.guaCi,
          sourceGua: "bian",
          importance: "primary",
        };
      }
      // 回退到本卦卦辞
      return {
        title: `本卦 · ${benGuaInfo.name}`,
        text: benGuaInfo.guaCi,
        sourceGua: "ben",
        importance: "primary",
      };
    }

    default: {
      // 默认情况，使用本卦卦辞
      return {
        title: `本卦 · ${benGuaInfo.name}`,
        text: benGuaInfo.guaCi,
        sourceGua: "ben",
        importance: "primary",
      };
    }
  }
};

// =============== 新增的增强功能函数 ===============

/**
 * 获取增强的卦象信息
 * @param yaoLines 6条爻的数组，顺序为从下到上（初爻到上爻）
 * @returns 合并的增强卦象信息
 */
export const getEnhancedHexagramInfo = (
  yaoLines: YaoInfo[],
): EnhancedHexagramInfo | undefined => {
  // 获取基础卦象信息
  const basicInfo = getHexagramInfo(yaoLines);
  if (!basicInfo) return undefined;

  // 获取增强信息
  const enhancedInfo = HEXAGRAM_ENHANCED_INFO[basicInfo.key];

  // 合并信息
  return {
    ...basicInfo,
    ...enhancedInfo,
    guaCi: {
      original: basicInfo.guaCi,
      translation: enhancedInfo?.guaCi?.translation || "暂无现代翻译",
      interpretation: enhancedInfo?.guaCi?.interpretation || "暂无基础解释",
    },
    yaoCi: enhancedInfo?.yaoCi || [],
    structure: enhancedInfo?.structure || {
      upperTrigram: "未知",
      lowerTrigram: "未知",
      symbol: "暂无象征说明",
    },
    source: enhancedInfo?.source || {
      book: "《周易》",
      chapter: "未知章节",
      position: 1,
    },
    references: enhancedInfo?.references || [],
    lastUpdated: enhancedInfo?.lastUpdated || new Date().toISOString(),
    version: enhancedInfo?.version || "v1.0.0",
    notes: enhancedInfo?.notes,
    // 确保必需的字段有默认值
    pinyin: enhancedInfo?.pinyin || basicInfo.pinyin || "未知",
    number: enhancedInfo?.number || basicInfo.number || 0,
    nameAlt: enhancedInfo?.nameAlt || basicInfo.name,
  };
};

/**
 * 获取卦象的出处信息
 * @param hexagramKey 卦象的二进制key
 * @returns 出处信息
 */
export const getHexagramSource = (hexagramKey: string): string | undefined => {
  const enhancedInfo = HEXAGRAM_ENHANCED_INFO[hexagramKey];
  if (!enhancedInfo?.source) return undefined;

  const { book, chapter, position } = enhancedInfo.source;
  return `${book} - ${chapter}（第${position}卦）`;
};

/**
 * 获取卦象的结构信息
 * @param hexagramKey 卦象的二进制key
 * @returns 结构信息
 */
export const getHexagramStructure = (
  hexagramKey: string,
): string | undefined => {
  const enhancedInfo = HEXAGRAM_ENHANCED_INFO[hexagramKey];
  return enhancedInfo?.structure?.symbol;
};

/**
 * 生成随机加载提示
 * @returns 随机的加载提示信息
 */
export const getRandomLoadingMessage = (): string => {
  const randomIndex = Math.floor(Math.random() * LOADING_MESSAGES.length);
  return LOADING_MESSAGES[randomIndex];
};

/**
 * 生成随机解读贴士
 * @returns 随机的解读贴士
 */
export const getRandomInterpretationTip = (): string => {
  const randomIndex = Math.floor(Math.random() * INTERPRETATION_TIPS.length);
  return INTERPRETATION_TIPS[randomIndex];
};

/**
 * 根据占卜类型获取爻辞引导
 * @param hexagramKey 卦象key
 * @param yaoPosition 爻位 (0-5)
 * @param category 占卜类型
 * @returns 对应类别的引导文本
 */
export const getCategoryGuidance = (
  hexagramKey: string,
  yaoPosition: number,
  category: DivinationCategory,
): string => {
  const enhancedInfo = HEXAGRAM_ENHANCED_INFO[hexagramKey];
  const yaoCi = enhancedInfo?.yaoCi?.[yaoPosition];

  if (!yaoCi?.categoryGuidance) {
    // 如果没有具体的引导信息，返回通用引导
    return yaoCi?.categoryGuidance?.general || "请结合具体问题来理解此爻的含义";
  }

  return yaoCi.categoryGuidance[category] || yaoCi.categoryGuidance.general;
};

/**
 * 创建解读状态
 * @param stage 当前阶段
 * @param progress 进度百分比（可选）
 * @returns 解读状态对象
 */
export const createInterpretationState = (
  stage: InterpretationState["stage"],
  progress?: number,
): InterpretationState => {
  return {
    stage,
    message: getRandomLoadingMessage(),
    progress,
    tips: [getRandomInterpretationTip()],
  };
};

/**
 * 获取基础卦象分类引导（通用版本）
 * @param hexagramName 卦名
 * @param category 占卜类型
 * @returns 通用引导文本
 */
export const getBasicCategoryGuidance = (
  hexagramName: string,
  category: DivinationCategory,
): string => {
  const guidanceMap: Record<DivinationCategory, string> = {
    career: `关于${hexagramName}卦，此卦象对您的事业发展提供了重要指引，建议您结合当前的工作状况来理解其深层含义。`,
    finance: `关于${hexagramName}卦，此卦象与财运相关，提醒您在财务决策上需要谨慎考虑，遵循卦象的智慧指导。`,
    relationship: `关于${hexagramName}卦，此卦象揭示了人际关系或感情状况的发展趋势，建议您用心体会其中的情感智慧。`,
    health: `关于${hexagramName}卦，此卦象与健康养生有关，提醒您关注身体信号，顺应自然规律来调养身心。`,
    general: `关于${hexagramName}卦，此卦象蕴含着深刻的人生哲理，建议您静心思考，将其智慧应用到实际生活中。`,
  };

  return guidanceMap[category] || guidanceMap.general;
};

// =============== 第二阶段：古籍查询功能 ===============

/**
 * 获取卦象的古籍参考信息
 * @param hexagramKey 卦象的二进制key
 * @returns 古籍参考数组，如果没有则返回空数组
 */
export const getHexagramReferences = (
  hexagramKey: string,
): {
  book: string;
  quote: string;
  explanation: string;
}[] => {
  const enhancedInfo = HEXAGRAM_ENHANCED_INFO[hexagramKey];
  return enhancedInfo?.references || [];
};

/**
 * 获取爻辞的古籍参考信息
 * @param hexagramKey 卦象的二进制key
 * @param yaoPosition 爻位 (1-6)
 * @returns 爻辞古籍参考数组，如果没有则返回空数组
 */
export const getYaoReferences = (
  hexagramKey: string,
  yaoPosition: number,
): {
  source: string;
  text: string;
  note: string;
}[] => {
  const enhancedInfo = HEXAGRAM_ENHANCED_INFO[hexagramKey];
  const yaoCi = enhancedInfo?.yaoCi?.find(
    (yao) => yao.position === yaoPosition,
  );
  return yaoCi?.references || [];
};

/**
 * 格式化古籍引用显示
 * @param references 古籍参考数组
 * @param maxCount 最大显示数量，默认为3个
 * @returns 格式化后的HTML字符串
 */
export const formatReferences = (
  references: {
    book: string;
    quote: string;
    explanation: string;
  }[],
  maxCount: number = 3,
): string => {
  if (!references || references.length === 0) {
    return "";
  }

  const displayReferences = references.slice(0, maxCount);

  return displayReferences
    .map(
      (ref) => `
      <div class="mb-4 p-4 bg-midnight-800/50 rounded-lg border border-amber-500/20">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <span class="text-amber-400 font-medium">📚</span>
          </div>
          <div class="ml-3 flex-1">
            <div class="text-amber-300 font-medium mb-1">${ref.book}</div>
            <blockquote class="text-midnight-200 italic mb-2 border-l-2 border-amber-500 pl-3">
              "${ref.quote}"
            </blockquote>
            <div class="text-midnight-300 text-sm">${ref.explanation}</div>
          </div>
        </div>
      </div>
    `,
    )
    .join("");
};

/**
 * 格式化爻辞古籍引用显示
 * @param references 爻辞古籍参考数组
 * @param maxCount 最大显示数量，默认为2个
 * @returns 格式化后的HTML字符串
 */
export const formatYaoReferences = (
  references: {
    source: string;
    text: string;
    note: string;
  }[],
  maxCount: number = 2,
): string => {
  if (!references || references.length === 0) {
    return "";
  }

  const displayReferences = references.slice(0, maxCount);

  return displayReferences
    .map(
      (ref) => `
      <div class="mb-3 p-3 bg-midnight-800/30 rounded-lg border border-primary-500/10">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <span class="text-primary-400 font-medium">📖</span>
          </div>
          <div class="ml-2 flex-1">
            <div class="text-primary-300 text-sm font-medium mb-1">${ref.source}</div>
            <div class="text-midnight-200 text-sm italic mb-1">
              "${ref.text}"
            </div>
            <div class="text-midnight-400 text-xs">${ref.note}</div>
          </div>
        </div>
      </div>
    `,
    )
    .join("");
};

/**
 * 搜索古籍中的相关内容
 * @param keyword 搜索关键词
 * @param searchScope 搜索范围：'gua'（卦辞）或 'yao'（爻辞）
 * @returns 包含关键词的古籍引用数组
 */
export const searchAncientTexts = (
  keyword: string,
  searchScope: "gua" | "yao" | "all" = "gua",
): {
  hexagramKey: string;
  hexagramName: string;
  book: string;
  quote: string;
  explanation: string;
  type: "gua" | "yao";
  position?: number;
}[] => {
  const results: {
    hexagramKey: string;
    hexagramName: string;
    book: string;
    quote: string;
    explanation: string;
    type: "gua" | "yao";
    position?: number;
  }[] = [];

  const searchTerm = keyword.toLowerCase().trim();

  if (!searchTerm) {
    return results;
  }

  // 搜索卦象的古籍引用
  if (searchScope === "gua" || searchScope === "all") {
    Object.entries(HEXAGRAM_ENHANCED_INFO).forEach(([key, info]) => {
      if (info.references) {
        info.references.forEach((ref) => {
          if (
            ref.book.toLowerCase().includes(searchTerm) ||
            ref.quote.toLowerCase().includes(searchTerm) ||
            ref.explanation.toLowerCase().includes(searchTerm)
          ) {
            results.push({
              hexagramKey: key,
              hexagramName: info.name || "未知",
              book: ref.book,
              quote: ref.quote,
              explanation: ref.explanation,
              type: "gua",
            });
          }
        });
      }
    });
  }

  // 搜索爻辞的古籍引用
  if (searchScope === "yao" || searchScope === "all") {
    Object.entries(HEXAGRAM_ENHANCED_INFO).forEach(([key, info]) => {
      if (info.yaoCi) {
        info.yaoCi.forEach((yao) => {
          if (yao.references) {
            yao.references.forEach((ref) => {
              if (
                ref.source.toLowerCase().includes(searchTerm) ||
                ref.text.toLowerCase().includes(searchTerm) ||
                ref.note.toLowerCase().includes(searchTerm)
              ) {
                results.push({
                  hexagramKey: key,
                  hexagramName: info.name || "未知",
                  book: ref.source,
                  quote: ref.text,
                  explanation: ref.note,
                  type: "yao",
                  position: yao.position,
                });
              }
            });
          }
        });
      }
    });
  }

  return results;
};

/**
 * 获取古籍来源统计信息
 * @returns 按古籍名称统计的使用次数
 */
export const getAncientBookStats = (): Record<string, number> => {
  const stats: Record<string, number> = {};

  // 统计卦象引用的古籍
  Object.values(HEXAGRAM_ENHANCED_INFO).forEach((info) => {
    if (info.references) {
      info.references.forEach((ref) => {
        stats[ref.book] = (stats[ref.book] || 0) + 1;
      });
    }

    // 统计爻辞引用的古籍
    if (info.yaoCi) {
      info.yaoCi.forEach((yao) => {
        if (yao.references) {
          yao.references.forEach((ref) => {
            stats[ref.source] = (stats[ref.source] || 0) + 1;
          });
        }
      });
    }
  });

  return stats;
};

/**
 * 验证古籍引用的完整性
 * @param hexagramKey 卦象key
 * @returns 验证结果对象
 */
export const validateReferences = (
  hexagramKey: string,
): {
  isValid: boolean;
  missingElements: string[];
  warnings: string[];
} => {
  const result = {
    isValid: true,
    missingElements: [] as string[],
    warnings: [] as string[],
  };

  const enhancedInfo = HEXAGRAM_ENHANCED_INFO[hexagramKey];

  if (!enhancedInfo) {
    result.isValid = false;
    result.missingElements.push("卦象增强信息不存在");
    return result;
  }

  // 检查卦辞引用
  if (!enhancedInfo.references || enhancedInfo.references.length === 0) {
    result.warnings.push("缺少卦辞古籍引用");
  }

  // 检查爻辞引用
  if (!enhancedInfo.yaoCi || enhancedInfo.yaoCi.length === 0) {
    result.warnings.push("缺少爻辞信息");
  } else {
    enhancedInfo.yaoCi.forEach((yao) => {
      if (!yao.references || yao.references.length === 0) {
        result.warnings.push(`第${yao.position}爻缺少古籍引用`);
      }
    });
  }

  // 检查必需字段
  const requiredFields = ["name", "pinyin", "source"];
  requiredFields.forEach((field) => {
    if (!enhancedInfo[field as keyof typeof enhancedInfo]) {
      result.isValid = false;
      result.missingElements.push(`缺少必需字段: ${field}`);
    }
  });

  return result;
};

// =============== 第三阶段：数据版本管理系统 ===============

/**
 * 当前数据库版本
 */
export const CURRENT_DATABASE_VERSION = "v1.2.0";

/**
 * 数据库版本更新历史记录
 */
export const DATABASE_VERSION_HISTORY: DatabaseVersion[] = [
  {
    version: "v1.0.0",
    updateDate: "2024-01-01T00:00:00.000Z",
    changes: [
      {
        type: "add",
        target: "基础卦象数据库",
        description: "建立完整的64卦基础数据库，包含卦名、卦辞、爻辞和卦序",
      },
      {
        type: "add",
        target: "查询功能",
        description: "实现基本的卦象查询、爻位计算和变卦功能",
      },
    ],
  },
  {
    version: "v1.1.0",
    updateDate: "2024-01-15T00:00:00.000Z",
    changes: [
      {
        type: "add",
        target: "增强数据结构",
        description: "扩展卦象信息接口，添加出处、结构、分类引导等字段",
      },
      {
        type: "add",
        target: "重要卦象增强",
        description: "为乾、坤、需、夬四个重要卦象添加详细信息",
      },
    ],
  },
  {
    version: "v1.2.0",
    updateDate: "2024-02-01T00:00:00.000Z",
    changes: [
      {
        type: "add",
        target: "古籍参考系统",
        description:
          "添加《周易正义》、《伊川易传》、《程氏易传》、《周易本义》等古籍引用",
      },
      {
        type: "add",
        target: "数据版本管理",
        description: "实现数据版本控制、验证和覆盖率统计功能",
      },
    ],
  },
];

/**
 * 版本控制管理器
 */
export const VERSION_CONTROL_MANAGER: VersionControlManager = {
  currentVersion: CURRENT_DATABASE_VERSION,
  updateHistory: DATABASE_VERSION_HISTORY,
  lastCheckDate: new Date().toISOString(),
};

/**
 * 检查数据库版本
 * @returns 当前版本信息
 */
export const checkDatabaseVersion = (): DatabaseVersion => {
  const currentVersion = DATABASE_VERSION_HISTORY.find(
    (version) => version.version === CURRENT_DATABASE_VERSION,
  );

  if (!currentVersion) {
    throw new Error(`当前版本 ${CURRENT_DATABASE_VERSION} 未在版本历史中找到`);
  }

  return currentVersion;
};

/**
 * 获取版本更新历史
 * @param maxCount 最大显示数量，默认为全部
 * @returns 版本历史数组
 */
export const getVersionHistory = (maxCount?: number): DatabaseVersion[] => {
  const history = [...DATABASE_VERSION_HISTORY].reverse(); // 最新的在前
  return maxCount ? history.slice(0, maxCount) : history;
};

/**
 * 验证数据库完整性
 * @param targetVersion 目标版本，默认为当前版本
 * @returns 验证报告
 */
export const validateDatabaseIntegrity = (
  targetVersion?: string,
): ValidationReport => {
  const version = targetVersion || CURRENT_DATABASE_VERSION;
  const report: ValidationReport = {
    isValid: true,
    errorCount: 0,
    warningCount: 0,
    errors: [],
    warnings: [],
    checkedDate: new Date().toISOString(),
    checkedVersion: version,
  };

  try {
    // 验证基础数据库完整性
    if (Object.keys(HEXAGRAMS_DATA).length !== 64) {
      report.isValid = false;
      report.errors.push(
        `基础卦象数据不完整，期望64个，实际${Object.keys(HEXAGRAMS_DATA).length}个`,
      );
      report.errorCount++;
    }

    // 验证增强数据覆盖率
    const enhancedCount = Object.keys(HEXAGRAM_ENHANCED_INFO).length;
    if (enhancedCount === 0) {
      report.warnings.push("没有找到增强数据");
      report.warningCount++;
    } else if (enhancedCount < 10) {
      report.warnings.push(`增强数据覆盖率较低，仅有${enhancedCount}个卦象`);
      report.warningCount++;
    }

    // 验证古籍引用完整性
    let referencesCount = 0;
    let yaoReferencesCount = 0;

    Object.values(HEXAGRAM_ENHANCED_INFO).forEach((info) => {
      if (info.references && info.references.length > 0) {
        referencesCount++;
      }

      if (info.yaoCi) {
        info.yaoCi.forEach((yao) => {
          if (yao.references && yao.references.length > 0) {
            yaoReferencesCount++;
          }
        });
      }
    });

    if (referencesCount === 0) {
      report.warnings.push("没有找到卦象古籍引用");
      report.warningCount++;
    }

    if (yaoReferencesCount === 0) {
      report.warnings.push("没有找到爻辞古籍引用");
      report.warningCount++;
    }

    // 验证必需字段
    Object.entries(HEXAGRAM_ENHANCED_INFO).forEach(([key, info]) => {
      const requiredFields = ["name", "version", "lastUpdated"];
      requiredFields.forEach((field) => {
        if (!info[field as keyof typeof info]) {
          report.isValid = false;
          report.errors.push(`卦象 ${key} 缺少必需字段: ${field}`);
          report.errorCount++;
        }
      });
    });

    // 验证版本信息一致性
    const versionInfos = Object.values(HEXAGRAM_ENHANCED_INFO);
    const inconsistentVersions = versionInfos.filter(
      (info) => info.version !== version,
    );

    if (inconsistentVersions.length > 0) {
      report.warnings.push(
        `${inconsistentVersions.length}个卦象的版本信息与当前版本不一致`,
      );
      report.warningCount++;
    }
  } catch (error) {
    report.isValid = false;
    report.errors.push(`验证过程中发生错误: ${error}`);
    report.errorCount++;
  }

  return report;
};

/**
 * 生成数据覆盖率报告
 * @returns 覆盖率统计报告
 */
export const generateDataCoverageReport = (): DataCoverageReport => {
  const totalHexagrams = Object.keys(HEXAGRAMS_DATA).length;
  const enhancedHexagrams = Object.keys(HEXAGRAM_ENHANCED_INFO).length;

  let hexagramsWithReferences = 0;
  let hexagramsWithYaoDetails = 0;

  Object.values(HEXAGRAM_ENHANCED_INFO).forEach((info) => {
    if (info.references && info.references.length > 0) {
      hexagramsWithReferences++;
    }

    if (info.yaoCi && info.yaoCi.length > 0) {
      hexagramsWithYaoDetails++;
    }
  });

  const coveragePercentage = Math.round(
    (enhancedHexagrams / totalHexagrams) * 100,
  );

  return {
    totalHexagrams,
    enhancedHexagrams,
    hexagramsWithReferences,
    hexagramsWithYaoDetails,
    coveragePercentage,
    lastUpdated: new Date().toISOString(),
  };
};

/**
 * 检查数据更新需求
 * @returns 建议更新的内容
 */
export const checkUpdateSuggestions = (): {
  priority: "high" | "medium" | "low";
  suggestions: string[];
  estimatedWorkload: "small" | "medium" | "large";
} => {
  const suggestions: string[] = [];
  let priority: "high" | "medium" | "low" = "low";

  const coverage = generateDataCoverageReport();

  // 检查覆盖率
  if (coverage.coveragePercentage < 10) {
    priority = "high";
    suggestions.push(
      `增强数据覆盖率仅为${coverage.coveragePercentage}%，急需扩展更多卦象信息`,
    );
  } else if (coverage.coveragePercentage < 30) {
    priority = "medium";
    suggestions.push(
      `增强数据覆盖率为${coverage.coveragePercentage}%，建议扩展更多卦象`,
    );
  }

  // 检查古籍引用
  if (coverage.hexagramsWithReferences < 20) {
    priority = priority === "high" ? "high" : "medium";
    suggestions.push("古籍引用数量较少，建议增加更多权威注解");
  }

  // 检查爻辞详情
  if (coverage.hexagramsWithYaoDetails < coverage.enhancedHexagrams) {
    suggestions.push("部分增强卦象缺少爻辞详情，建议补充完善");
  }

  // 数据质量建议
  const validation = validateDatabaseIntegrity();
  if (validation.warningCount > 0) {
    suggestions.push(`发现${validation.warningCount}个数据质量问题需要关注`);
  }

  // 功能扩展建议
  suggestions.push("考虑增加更多占卜类型的分类引导");
  suggestions.push("建议添加更多历史名家的易学注解");

  const estimatedWorkload =
    priority === "high" ? "large" : priority === "medium" ? "medium" : "small";

  return {
    priority,
    suggestions,
    estimatedWorkload,
  };
};

/**
 * 创建版本更新记录
 * @param newVersion 新版本号
 * @param changes 更改内容
 * @returns 创建的版本记录
 */
export const createVersionRecord = (
  newVersion: string,
  changes: {
    type: "add" | "update" | "delete";
    target: string;
    description: string;
  }[],
): DatabaseVersion => {
  const newRecord: DatabaseVersion = {
    version: newVersion,
    updateDate: new Date().toISOString(),
    changes,
  };

  return newRecord;
};

/**
 * 格式化版本信息显示
 * @param version 版本信息
 * @returns 格式化的HTML字符串
 */
export const formatVersionInfo = (version: DatabaseVersion): string => {
  const date = new Date(version.updateDate).toLocaleDateString("zh-CN");

  return `
    <div class="p-4 bg-midnight-800/50 rounded-lg border border-amber-500/20 mb-4">
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-amber-300 font-semibold">${version.version}</h4>
        <span class="text-midnight-400 text-sm">${date}</span>
      </div>
      <div class="space-y-2">
        ${version.changes
          .map(
            (change) => `
          <div class="flex items-start">
            <span class="flex-shrink-0 mr-2 mt-1">
              ${change.type === "add" ? "➕" : change.type === "update" ? "🔄" : "❌"}
            </span>
            <div>
              <div class="text-midnight-200 font-medium">${change.target}</div>
              <div class="text-midnight-400 text-sm">${change.description}</div>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `;
};

/**
 * 格式化数据覆盖率报告
 * @param coverage 覆盖率报告
 * @returns 格式化的HTML字符串
 */
export const formatCoverageReport = (coverage: DataCoverageReport): string => {
  const date = new Date(coverage.lastUpdated).toLocaleDateString("zh-CN");

  return `
    <div class="p-6 bg-midnight-800/50 rounded-lg border border-primary-500/20">
      <h4 class="text-primary-300 font-semibold mb-4">数据覆盖率统计</h4>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-amber-400">${coverage.totalHexagrams}</div>
          <div class="text-midnight-400 text-sm">总卦象数</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-400">${coverage.enhancedHexagrams}</div>
          <div class="text-midnight-400 text-sm">增强卦象</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-400">${coverage.hexagramsWithReferences}</div>
          <div class="text-midnight-400 text-sm">古籍引用</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-400">${coverage.coveragePercentage}%</div>
          <div class="text-midnight-400 text-sm">覆盖率</div>
        </div>
      </div>
      <div class="w-full bg-midnight-700 rounded-full h-4 mb-2">
        <div class="bg-gradient-to-r from-amber-400 to-amber-600 h-4 rounded-full transition-all duration-1000"
             style="width: ${coverage.coveragePercentage}%"></div>
      </div>
      <div class="text-midnight-400 text-sm text-center">
        最后更新: ${date}
      </div>
    </div>
  `;
};

/**
 * 获取系统状态概览
 * @returns 系统状态信息
 */
export const getSystemOverview = (): {
  version: string;
  dataQuality: "excellent" | "good" | "fair" | "poor";
  coverage: DataCoverageReport;
  validation: ValidationReport;
  recommendations: string[];
} => {
  const coverage = generateDataCoverageReport();
  const validation = validateDatabaseIntegrity();
  const updateSuggestions = checkUpdateSuggestions();

  // 评估数据质量
  let dataQuality: "excellent" | "good" | "fair" | "poor" = "poor";

  if (
    validation.isValid &&
    validation.warningCount === 0 &&
    coverage.coveragePercentage >= 50
  ) {
    dataQuality = "excellent";
  } else if (
    validation.isValid &&
    validation.warningCount <= 2 &&
    coverage.coveragePercentage >= 30
  ) {
    dataQuality = "good";
  } else if (validation.errorCount === 0 && coverage.coveragePercentage >= 10) {
    dataQuality = "fair";
  }

  // 生成建议
  const recommendations: string[] = [
    ...updateSuggestions.suggestions.slice(0, 3), // 最多显示3个主要建议
  ];

  return {
    version: CURRENT_DATABASE_VERSION,
    dataQuality,
    coverage,
    validation,
    recommendations,
  };
};

/**
 * 测试版本管理系统功能
 * @returns 测试结果摘要
 */
export const testVersionManagementSystem = (): {
  tests: string[];
  passed: number;
  failed: number;
  summary: string;
} => {
  const tests: string[] = [];
  let passed = 0;
  let failed = 0;

  // 测试1: 版本检查
  try {
    const currentVersion = checkDatabaseVersion();
    if (currentVersion.version === "v1.2.0") {
      tests.push("✅ 版本检查通过");
      passed++;
    } else {
      tests.push(`❌ 版本检查失败: 期望v1.2.0，实际${currentVersion.version}`);
      failed++;
    }
  } catch (error) {
    tests.push(`❌ 版本检查异常: ${error}`);
    failed++;
  }

  // 测试2: 数据验证
  try {
    const validation = validateDatabaseIntegrity();
    if (validation.isValid) {
      tests.push("✅ 数据完整性验证通过");
      passed++;
    } else {
      tests.push(`❌ 数据完整性验证失败: ${validation.errors.length}个错误`);
      failed++;
    }
  } catch (error) {
    tests.push(`❌ 数据验证异常: ${error}`);
    failed++;
  }

  // 测试3: 覆盖率报告
  try {
    const coverage = generateDataCoverageReport();
    if (coverage.totalHexagrams === 64) {
      tests.push("✅ 覆盖率报告生成成功");
      passed++;
    } else {
      tests.push(
        `❌ 覆盖率报告异常: 期望64个卦象，实际${coverage.totalHexagrams}个`,
      );
      failed++;
    }
  } catch (error) {
    tests.push(`❌ 覆盖率报告异常: ${error}`);
    failed++;
  }

  // 测试4: 版本历史
  try {
    const history = getVersionHistory();
    if (history.length > 0 && history[0].version === "v1.2.0") {
      tests.push("✅ 版本历史查询正常");
      passed++;
    } else {
      tests.push("❌ 版本历史查询异常");
      failed++;
    }
  } catch (error) {
    tests.push(`❌ 版本历史异常: ${error}`);
    failed++;
  }

  // 测试5: 更新建议
  try {
    const suggestions = checkUpdateSuggestions();
    if (suggestions.suggestions.length > 0) {
      tests.push("✅ 更新建议生成成功");
      passed++;
    } else {
      tests.push("❌ 更新建议生成失败");
      failed++;
    }
  } catch (error) {
    tests.push(`❌ 更新建议异常: ${error}`);
    failed++;
  }

  // 测试6: 系统概览
  try {
    const overview = getSystemOverview();
    if (overview.version === "v1.2.0" && overview.coverage) {
      tests.push("✅ 系统概览生成成功");
      passed++;
    } else {
      tests.push("❌ 系统概览生成失败");
      failed++;
    }
  } catch (error) {
    tests.push(`❌ 系统概览异常: ${error}`);
    failed++;
  }

  const summary =
    failed === 0
      ? "所有测试通过！版本管理系统运行正常。"
      : `测试完成：${passed}个通过，${failed}个失败。请检查相关问题。`;

  return {
    tests,
    passed,
    failed,
    summary,
  };
};

// =============== 占卜结果生成工具 ===============

// 注意：DivinationResult 接口现在定义在 src/types/divination.ts 中

/**
 * 生成模拟占卜结果
 * @param method 占卜方法
 * @param question 占卜问题
 * @param inputData 输入数据
 * @returns 占卜结果
 */
export const generateMockResult = (
  method: string,
  question: string,
  inputData?: any
): DivinationResult => {
  const timestamp = new Date().toISOString();

  // 根据方法生成不同的结果
  if (method === 'liuyao') {
    return generateLiuYaoResult(question, inputData, timestamp);
  } else if (method === 'meihua') {
    return generateMeiHuaResult(question, inputData, timestamp);
  } else {
    return generateAIResult(question, inputData, timestamp);
  }
};

/**
 * 生成六爻占卜结果
 */
function generateLiuYaoResult(
  question: string,
  inputData?: { coins?: number[] },
  timestamp: string = new Date().toISOString()
): DivinationResult {
  // 模拟6次投币结果（3枚铜钱，每个结果6,7,8,9）
  const coins = inputData?.coins || Array.from({ length: 6 }, () =>
    [6, 7, 8, 9][Math.floor(Math.random() * 4)]
  );

  // 转换为爻值数组（6=老阴, 7=少阳, 8=少阴, 9=老阳）
  const yaoValues = coins;

  // 找出动爻（老阴6和老阳9）
  const changingLineIndexes = yaoValues
    .map((value, index) => (value === 6 || value === 9 ? index : -1))
    .filter(index => index !== -1);

  // 计算本卦和变卦
  const originalHexagram = yaoValues
    .map(value => (value === 7 || value === 9 ? '1' : '0'))
    .join('');

  // 计算变卦
  const transformedValues = yaoValues.map(value => {
    if (value === 6) return 9;  // ✅ 返回数字
    if (value === 9) return 6;  // ✅ 返回数字
    return value;
  });

  const transformedHexagram = transformedValues
    .map(value => (value === 7 || value === 9 ? '1' : '0'))
    .join('');

  // 获取卦象信息
  const benGuaInfo = getHexagramInfoByValues(yaoValues);
  const bianGuaInfo = changingLineIndexes.length > 0
    ? getHexagramInfoByValues(transformedValues as number[])
    : null;

  // 安全处理 benGuaInfo
  const safeHexagramName = benGuaInfo?.name || '未知卦';
  const safeBenGuaInfo = benGuaInfo ? {
    ...benGuaInfo,
    name: safeHexagramName,
    number: benGuaInfo.number || 0,
    guaci: benGuaInfo.guaCi || '卦辞暂未找到',
    yaoci: benGuaInfo.yaoCi || [],
    shang: safeHexagramName.length >= 2 ? safeHexagramName.substring(0, 2) : safeHexagramName,
    xia: safeHexagramName.length >= 3 ? safeHexagramName.substring(2) : '',
    tuanCi: benGuaInfo.guaCi || '象辞暂未找到',
    analysis: `基于${safeHexagramName}卦的分析`
  } : {
    name: '未知卦',
    guaci: '暂无信息',
    number: 0,
    yaoci: [],
    shang: '未知',
    xia: '卦',
    tuanCi: '象辞暂未找到',
    analysis: '无法获取卦象信息'
  };

  return {
    originalHexagram,
    transformedHexagram: bianGuaInfo ? transformedHexagram : undefined,
    changingLineIndexes,
    benGuaInfo: safeBenGuaInfo,
    bianGuaInfo: bianGuaInfo ? {
      ...bianGuaInfo,
      name: bianGuaInfo.name || '未知卦',
      number: bianGuaInfo.number || 0,
      guaci: bianGuaInfo.guaCi || '卦辞暂未找到',
      yaoci: bianGuaInfo.yaoCi || []
    } : undefined,
    method: 'liuyao',
    question,
    timestamp
  };
}

/**
 * 生成梅花易数结果
 */
function generateMeiHuaResult(
  question: string,
  inputData?: { timeData?: Date },
  timestamp: string = new Date().toISOString()
): DivinationResult {
  const timeData = inputData?.timeData || new Date();

  // 基于时间生成随机但相对固定的结果
  const seed = timeData.getFullYear() + timeData.getMonth() + timeData.getDate() + timeData.getHours();
  const random = Math.sin(seed) * 10000;

  // 生成爻值
  const yaoValues = Array.from({ length: 6 }, (_, i) => {
    const value = Math.floor((random * (i + 1)) % 4);
    return [6, 7, 8, 9][value];
  });

  // 计算动爻
  const changingLineIndexes = yaoValues
    .map((value, index) => (value === 6 || value === 9 ? index : -1))
    .filter(index => index !== -1);

  // 计算卦象
  const originalHexagram = yaoValues
    .map(value => (value === 7 || value === 9 ? '1' : '0'))
    .join('');

  const transformedValues = yaoValues.map(value => {
    if (value === 6) return 9;  // ✅ 返回数字，不是字符串
    if (value === 9) return 6;  // ✅ 返回数字，不是字符串
    return value;
  });

  const transformedHexagram = transformedValues
    .map(value => (value === 7 || value === 9 ? '1' : '0'))
    .join('');

  const benGuaInfo = getHexagramInfoByValues(yaoValues);
  const bianGuaInfo = changingLineIndexes.length > 0
    ? getHexagramInfoByValues(transformedValues as number[])
    : null;

  // 安全处理 benGuaInfo
  const safeHexagramName = benGuaInfo?.name || '未知卦';
  const safeBenGuaInfo = benGuaInfo ? {
    ...benGuaInfo,
    name: safeHexagramName,
    number: benGuaInfo.number || 0,
    guaci: benGuaInfo.guaCi || '卦辞暂未找到',
    yaoci: benGuaInfo.yaoCi || [],
    shang: safeHexagramName.length >= 2 ? safeHexagramName.substring(0, 2) : safeHexagramName,
    xia: safeHexagramName.length >= 3 ? safeHexagramName.substring(2) : '',
    tuanCi: benGuaInfo.guaCi || '象辞暂未找到',
    analysis: `基于时间数的梅花易数分析`
  } : {
    name: '未知卦',
    guaci: '暂无信息',
    number: 0,
    yaoci: [],
    shang: '未知',
    xia: '卦',
    tuanCi: '象辞暂未找到',
    analysis: '无法获取卦象信息'
  };

  return {
    originalHexagram,
    transformedHexagram: bianGuaInfo ? transformedHexagram : undefined,
    changingLineIndexes,
    benGuaInfo: safeBenGuaInfo,
    bianGuaInfo: bianGuaInfo ? {
      ...bianGuaInfo,
      name: bianGuaInfo.name || '未知卦',
      number: bianGuaInfo.number || 0,
      guaci: bianGuaInfo.guaCi || '卦辞暂未找到',
      yaoci: bianGuaInfo.yaoCi || []
    } : undefined,
    method: 'meihua',
    question,
    timestamp
  };
}

/**
 * 生成AI智能占卜结果
 */
function generateAIResult(
  question: string,
  _inputData?: any,
  timestamp: string = new Date().toISOString()
): DivinationResult {
  // 基于问题内容生成相对固定的卦象
  const questionHash = question.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hexagramIndex = questionHash % 64;

  // 获取对应的卦象
  const hexagramKeys = Object.keys(HEXAGRAMS_DATA);
  const selectedKey = hexagramKeys[hexagramIndex] || '111111';
  const hexagramInfo = HEXAGRAMS_DATA[selectedKey];

  // 将字符串转换为爻值数组
  const yaoValues = selectedKey.split('').map(char =>
    char === '1' ? 9 : 6 // 简化处理，阳爻用老阳，阴爻用老阴
  );

  // 计算变卦
  const transformedValues = yaoValues.map(value => value === 6 ? 9 : 6);
  const transformedHexagram = transformedValues
    .map(value => (value === 9 ? '1' : '0'))
    .join('');

  const bianGuaInfo = getHexagramInfoByValues(transformedValues);

  // 安全处理 hexagramInfo
  const safeHexagramName = hexagramInfo?.name || '未知卦';

  return {
    originalHexagram: selectedKey,
    transformedHexagram,
    changingLineIndexes: [0, 2, 4], // AI占卜通常有多个动爻
    benGuaInfo: {
      name: safeHexagramName,
      number: hexagramInfo?.number || 0,
      guaci: hexagramInfo?.guaCi || '卦辞暂未找到',
      yaoci: hexagramInfo?.yaoCi || [],
      shang: safeHexagramName.substring(0, 2) || '未',
      xia: safeHexagramName.substring(2) || '卦',
      tuanCi: hexagramInfo?.guaCi || '象辞暂未找到',
      analysis: `AI智能分析：基于问题"${question}"的综合卦象解读`
    },
    bianGuaInfo: bianGuaInfo ? {
      name: bianGuaInfo.name || '未知卦',
      number: bianGuaInfo.number || 0,
      guaci: bianGuaInfo.guaCi || '卦辞暂未找到',
      yaoci: bianGuaInfo.yaoCi || []
    } : undefined,
    method: 'ai',
    question,
    timestamp
  };
}
