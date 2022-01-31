# Preload Api

> Additional functionality for _ApiResource_[+axios-rest-api]

_async_ **fill**(list, rules, [defaultRegexp]) - раскрыть на первом уровне в соответствии с правилом, или списком правил

```js
# Rules (array)
['user'] - string field name, use defaultRegexp if needed
['user', 'profile']
  # use defaultRegexp
[['user', '^/api/users/\\d+']] - array of rules, 
  # first element - string field name
  # second element - URI regexp
  # use defaultRegexp if needed, if empty second element or rule
```

**expand**(object, field, [regexp], [isPublic]) - простое раскрытие по индексу

---

_async_ **load**(object, [regexp], [field], [isPublic]) - одноуровневый поиск и загрузка

_async_ **deep**(object, [regexp], [field], [isPublic]) - рекурсивное раскрытие на всю глубину, регулярное выражение

_async_ **list**(uris, [regexp], [isPublic]) - загружает по списку адресов

---

_async_ **relation**(uri, [regexp], [isPublic]) - загружает и возвращает значение

