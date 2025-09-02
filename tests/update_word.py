from ECDICT_resources.stardict import DictCsv

ecdict = DictCsv(r'..\ECDICT_resources\ecdict.csv')

word = 'Target word'
data = {
    'translation': 'My translation'
}

is_success = ecdict.update(word, data)
print(is_success)