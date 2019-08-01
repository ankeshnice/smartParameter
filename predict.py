import py2neo
import pandas as pd
import sys
import json
from operator import itemgetter


data = sys.argv
#data1 = str(sys.argv[1])
data1 =  'W5d1UsinZwjw9D'
#print('input to py form Node ' + data2);
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

graph = py2neo.Graph(bolt=True, host='localhost', user='neo4j', password='ne04j')
df = pd.DataFrame(graph.run("MATCH (a)-[r:Att0AttrRelation]->(b:Att0MeasurableAttributeInt) WHERE a.block_name='Noise - Exterior' RETURN b.owning_user AS User,b.owning_group AS Group,a.revisionId AS RevId, a.object_name AS TARGET, b.ObjectUID AS PARAMETER, b.att0AttrDefRev AS PARAM_DEF"))

df5 = df
test1 = "MATCH (a:Fnd0LogicalBlockRevision) WHERE a.ObjectUID ='"+data1+"' RETURN a.owning_user AS User1,a.owning_group AS Group1,a.revisionId AS RevId"
df2 = pd.DataFrame(graph.run(test1))

user=df2.iloc[0,0]
group=df2.iloc[0,1]
revID=df2.iloc[0,2]

test2 = "MATCH (a:Att0TargetRevision)-[r:FND_TraceLink]->(b:Fnd0LogicalBlockRevision) WHERE b.ObjectUID ='"+data1+"' RETURN a.object_name AS TARGET"
df3 = pd.DataFrame(graph.run(test2))

target=df3.iloc[0,0]

df.columns = ["User", "Group", "RevId", "TARGET", "PARAMETER", "PARAM_DEF"]
features = ['User','Group','RevId','TARGET']
df = df.append(pd.Series([user, group, revID, target, "", ""], index=df.columns ), ignore_index=True)

def combine_features(row):
    return row['User']+" "+row['Group']+" "+row['RevId']+" "+row['TARGET']
    
for feature in features:
    df[feature] = df[feature].fillna('')
    
df["combined_features"] = df.apply(combine_features,axis=1)

cv = CountVectorizer()
count_matrix = cv.fit_transform(df["combined_features"])
cosine_sim = cosine_similarity(count_matrix,count_matrix)

rows = df.shape[0]
similar_params =  list(enumerate(cosine_sim[3]))
#predictions = []
def sortByPrediction(predictionObj):
  return predictionObj['prediction']
  
predictions = [] 
i=0
for element in similar_params:
    num = element[1]
    if num > 0.1:
       # print(df.iloc[i,4])
       # print(df.iloc[i,5])
        #print(num)
        df6=(df5[df5['PARAMETER'] == df.iloc[i,4]])
        df7=df6['RevId'].unique().tolist()
        df8=df6['TARGET'].unique().tolist()
        df9=df6['User'].unique().tolist()
        if num > 0.9:
          num=0.92
        #predictObj = { "parameter":df.iloc[i,4], "parameterDef":df.iloc[i,5], "prediction":int(round(num))*100,"revisionList":df7,"targetList":df8,"userList":df9}
        predictions.append({ "parameter":df.iloc[i,4], "parameterDef":df.iloc[i,5], "prediction":round(num*100),"revisionList":df7,"targetList":df8,"userList":df9})
        i=i+1
jsonPrediction = json.dumps(predictions)
sortedPrediction = jsonPrediction.sort(key=itemgetter('prediction'),reverse=True)
#sortedPrediction = sorted(predictions,key=sortByPrediction)
        #print(json.dumps(predictions))
print(sortedPrediction)
        #parsedPrediction.sort(key=lambda x: x.prediction)
        #print(parsedPredictions)
        
        #print (predictObj)
        #predictions.append({ "parameter":df.iloc[i,4], "parameterDef":df.iloc[i,5], "prediction":int(round(num))*100,"revisionList":df7,"targetList":df8,"userList":df9})
        #predictions.insert(i,{ "parameter":df.iloc[i,4], "parameterDef":df.iloc[i,5], "prediction":int(round(num))*100,"revisionList":df7,"targetList":df8,"userList":df9})
        #print(predictions);
        #print (predictions)

#app_json = json.dumps(predictions)
#print (predictions)
