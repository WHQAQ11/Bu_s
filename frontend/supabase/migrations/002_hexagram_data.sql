-- 卦象数据初始化
-- =====================================

-- 插入64卦基础数据
INSERT INTO hexagrams (hexagram_key, name, pinyin, number, guaci_original, guaci_translation, guaci_interpretation, yaoci, structure, source, references) VALUES
-- 乾卦
('111111', '乾', 'qian', 1, '元，亨，利，贞。', 'Original: Great and noble success. Perseverance is favorable.', '象征天道运行，刚健中正，代表创造、力量、主动。',
'["初九：潜龙，勿用。", "九二：见龙在田，利见大人。", "九三：君子终日乾乾，夕惕若厉，无咎。", "九四：或跃在渊，无咎。", "九五：飞龙在天，利见大人。", "上九：亢龙有悔。"]',
'{"upper_trigram": "乾", "lower_trigram": "乾", "element": "天", "nature": "阳", "season": "春夏"}',
'{"book": "易经", "chapter": "上经", "section": "乾卦"}',
'["《象》曰：天行健，君子以自强不息。", "《文言》曰：元者，善之長也；亨者，嘉之會也；利者，義之和也；貞者，事之幹也。"]'),

-- 坤卦
('000000', '坤', 'kun', 2, '元，亨，利牝马之贞。君子有攸往，先迷后得主，利西南得朋，东北丧朋。安贞，吉。', 'Original: Great and noble success. Perseverance is favorable for a mare. The superior man has a direction to go to. At first he loses his way, but later finds a master. It is favorable to find friends in the southwest and to lose friends in the northeast. Peaceful perseverance brings good fortune.', '象征大地，柔顺包容，代表接受、滋养、包容。',
'["初六：履霜，坚冰至。", "六二：直，方，大，不习无不利。", "六三：含章可贞。或从王事，无成有终。", "六四：括囊；无咎，无誉。", "六五：黄裳，元吉。", "上六：龙战于野，其血玄黄。"]',
'{"upper_trigram": "坤", "lower_trigram": "坤", "element": "地", "nature": "阴", "season": "夏秋"}',
'{"book": "易经", "chapter": "上经", "section": "坤卦"}',
'["《象》曰：地势坤，君子以厚德载物。", "《文言》曰：坤至柔而动也刚，至静而德方。"]'),

-- 屯卦
('010001', '屯', 'zhun', 3, '元，亨，利，贞。勿用，有攸往，利建侯。', 'Original: Great and noble success. Perseverance is favorable. Do not use it, but have a direction to go to. It is favorable to establish feudal lords.', '象征初生之艰难，代表困难、新生、突破。',
'["初九：磐桓；利居贞，利建侯。", "六二：屯如邅如，乘马班如。匪寇婚媾，女子贞不字，十年乃字。", "六三：即鹿无虞，惟入于林中，君子几不如舍，往吝。", "六四：乘马班如，求婚媾，往吉，无不利。", "九五：屯其膏，小贞吉，大贞凶。", "上六：乘马班如，泣血涟如。"]',
'{"upper_trigram": "坎", "lower_trigram": "震", "element": "水雷", "nature": "阳下阴上", "season": "初春"}',
'{"book": "易经", "chapter": "上经", "section": "屯卦"}',
'["《象》曰：云雷，屯；君子以经纶。"]'),

-- 蒙卦
('100010', '蒙', 'meng', 4, '亨。匪我求童蒙，童蒙求我。初噬告，再三渎，渎则不告。利贞。', 'Original: Success. It is not I who seek the young fool, the young fool seeks me. At the first oracle I inform him. If he asks two or three times, it is importunity. If he importunes, I do not inform him. Perseverance is favorable.', '象征蒙昧无知，代表教育、启发、启蒙。',
'["初六：发蒙，利用刑人，用说桎梏，以往吝。", "九二：包蒙吉；纳妇吉；子克家。", "六三：勿用娶女；见金夫，不有躬，无攸利。", "六四：困蒙，吝。", "六五：童蒙，吉。", "上九：击蒙；不利为寇，利御寇。"]',
'{"upper_trigram": "艮", "lower_trigram": "坎", "element": "山水", "nature": "山下有水", "season": "早春"}',
'{"book": "易经", "chapter": "上经", "section": "蒙卦"}',
'["《象》曰：山下出泉，蒙；君子以果行育德。"]'),

-- 需卦
('010111', '需', 'xu', 5, '有孚，光亨，贞吉。利涉大川。', 'Original: There is sincerity. There will be great success and good fortune. Perseverance is favorable. It is favorable to cross the great water.', '象征等待时机，代表耐心、期待、准备。',
'["初九：需于郊。利用恒，无咎。", "九二：需于沙。小有言，终吉。", "九三：需于泥，致寇至。", "六四：需于血，出自穴。", "九五：需于酒食，贞吉。", "上六：入于穴，有不速之客三人来，敬之终吉。"]',
'{"upper_trigram": "坎", "lower_trigram": "乾", "element": "水天", "nature": "天上有水", "season": "春季"}',
'{"book": "易经", "chapter": "上经", "section": "需卦"}',
'["《象》曰：云上于天，需；君子以饮食宴乐。"]'),

-- 讼卦
('111010', '讼', 'song', 6, '有孚，窒。惕中吉。终凶。利见大人，不利涉大川。', 'Original: There is sincerity, but it is obstructed. Being careful in the middle brings good fortune. In the end there is misfortune. It is favorable to see the great man. It is not favorable to cross the great water.', '象征争讼冲突，代表争议、诉讼、对抗。',
'["初六：不永所事，小有言，终吉。", "九二：不克讼，归而逋，其邑人三百户，无眚。", "六三：食旧德，贞厉，终吉。或从王事，无成。", "九四：不克讼，复即命渝，安贞吉。", "九五：讼元吉。", "上九：或锡之鞶带，终朝三褫之。"]',
'{"upper_trigram": "乾", "lower_trigram": "坎", "element": "天水", "nature": "水下有天", "season": "春末"}',
'{"book": "易经", "chapter": "上经", "section": "讼卦"}',
'["《象》曰：天与水违行，讼；君子以作事谋始。"]'),

-- 师卦
('010000', '师', 'shi', 7, '贞，丈人，吉无咎。', 'Original: Perseverance. The great man brings good fortune. No blame.', '象征军队行师，代表组织、纪律、出征。',
'["初六：师出以律，否臧凶。", "九二：在师中，吉无咎，王三锡命。", "六三：师或舆尸，凶。", "六四：师左次，无咎。", "六五：田有禽，利执言，无咎。长子帅师，弟子舆尸，贞凶。", "上六：大君有命，开国承家，小人勿用。"]',
'{"upper_trigram": "坤", "lower_trigram": "坎", "element": "地水", "nature": "地下有水", "season": "夏初"}',
'{"book": "易经", "chapter": "上经", "section": "师卦"}',
'["《象》曰：地中有水，师；君子以容民畜众。"]'),

-- 比卦
('000010', '比', 'bi', 8, '吉。原筮元永贞，无咎。不宁方来，后夫凶。', 'Original: Good fortune. The oracle consulted was thoroughly favorable. Perseverance is favorable. No blame. The previously restless came later and was in peril.', '象征亲密比附，代表团结、合作、亲近。',
'["初六：有孚比之，无咎。有孚盈缶，终来有他，吉。", "六二：比之自内，贞吉。", "六三：比之匪人。", "六四：外比之，贞吉。", "九五：显比，王用三驱，失前禽。邑人不诫，吉。", "上六：比之无首，凶。"]',
'{"upper_trigram": "坎", "lower_trigram": "坤", "element": "水地", "nature": "地上有水", "season": "夏季"}',
'{"book": "易经", "chapter": "上经", "section": "比卦"}',
'["《象》曰：地上有水，比；先王以建万国，亲诸侯。"]'),

-- 小畜卦
('111011', '小畜', 'xiao_chu', 9, '亨。密云不雨，自我西郊。', 'Original: Success. Dense clouds, no rain from our western territory.', '象征小有积蓄，代表小的阻碍、暂时的困难。',
'["初九：复自道，何其咎，吉。", "九二：牵复，吉。", "九三：舆说辐，夫妻反目。", "六四：有孚，血去惕出，无咎。", "九五：有孚挛如，富以其邻。", "上九：既雨既处，尚德载，妇贞厉。月几望，君子征凶。"]',
'{"upper_trigram": "巽", "lower_trigram": "乾", "element": "风天", "nature": "天上有风", "season": "夏末"}',
'{"book": "易经", "chapter": "上经", "section": "小畜卦"}',
'["《象》曰：风行天上，小畜；君子以懿文德。"]'),

-- 履卦
('110111', '履', 'lv', 10, '履虎尾，不咥人，亨。', 'Original: Treading on the tail of the tiger. The tiger does not bite the man. Success.', '象征谨慎前行，代表小心、谨慎、实践。',
'["初九：素履，往无咎。", "九二：履道坦坦，幽人贞吉。", "六三：眇能视，跛能履，履虎尾，咥人，凶。武人为于大君。", "九四：履虎尾，愬愬终吉。", "九五：夬履，贞厉。", "上九：视履考祥，其旋元吉。"]',
'{"upper_trigram": "乾", "lower_trigram": "兑", "element": "天泽", "nature": "泽上有天", "season": "秋初"}',
'{"book": "易经", "chapter": "上经", "section": "履卦"}',
'["《象》曰：上天下泽，履；君子以辨上下，定民志。"]'),

-- 继续添加更多卦象数据...
-- 这里为了示例只添加前10卦，实际应用中需要添加完整的64卦数据

ON CONFLICT (hexagram_key) DO NOTHING;