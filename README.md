# landlords
HTML4+CSS2+JavaScript实现的斗地主

# 重置桌子记录SQL
```
TRUNCATE TABLE desk_lead_logs;
TRUNCATE TABLE desks;
INSERT INTO desks (isPlaying)VALUES(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0),(0);
TRUNCATE TABLE user_score_logs;
UPDATE users SET deskId=0,deskPosition=NULL,scores=0;
```

# desk_action_logs.actionType
  * 1 => ACTION_TYPE_ROB_LANDLORDS: 抢地主，isRobot(是否机器人处理)
  * 2 => ACTION_TYPE_NO_ROB: 不抢
  * 3 => ACTION_TYPE_LANDLORDS: 确定地主
  * 4 => ACTION_TYPE_SEED_CARDS: 明牌
  * 5 => ACTION_TYPE_DOUBLE: 加倍
  * 6 => ACTION_TYPE_NO_DOUBLE: 不加倍
  * 7 => ACTION_TYPE_LEAD: 出牌，字段：deskPosition(桌位)，beforeCards(出牌前手中的牌)，leads(出的牌)，isRobot(是否机器人处理)
  * 8 => ACTION_TYPE_NO_LEAD: 不出
