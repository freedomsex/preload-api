import { map, each, mapObject, isObject, isArray, isEmpty, isString } from 'underscore';

export default class PreloadApi {
  constructor(api) {
    this.$api = {};
    this.api(api);
    this.isPublic = true;
  }

  private(value) {
    this.isPublic = value === false;
    return this;
  }

  api(api) {
    if (api) {
      this.$api = api;
    }
    return this.$api;
  }

  // Получение данных
  async fetch(uri, isPublic) {
    if (!this.$api) {
      throw 'API not specified';
    }
    // console.log('PRELoad', uri);
    let { data } = await this.$api.res(uri.substring(1), 'raw', isPublic).load();
    return data;
  }

  // Загрузка связи
  async relation(uri, regexp, isPublic) {
    if (regexp) {
      let re = new RegExp(regexp);
      if (re.test(uri)) {
        return await this.fetch(uri, isPublic);
      }
      return uri;
    }
    return await this.fetch(uri, isPublic);
  }

  // Загрука по списку
  async list(uris, regexp, isPublic) {
    return Promise.all(
      map(uris, (uri) => {
        return this.relation(uri, regexp, isPublic);
      }),
    );
  }

  async touch(object, value, key, regexp, field, isPublic) {
    if (isString(value)) {
      if (field && field !== key) {
        return;
      }
      object[key] = await this.relation(value, regexp, isPublic);
    } else {
      return await this.load(value, regexp, field, isPublic);
    }
  }

  // Одноуровневый поиск и загрузка
  async load(object, regexp, field, isPublic) {
    return Promise.all(
      map(object, (value, key) => {
        if (isString(value)) {
          return this.touch(object, value, key, regexp, field, isPublic);
        }
        if (isArray(value) && !isEmpty(value)) {
          if (isString(value[0])) {
            return this.touch(object, value, key, regexp, field, isPublic);
          }
        }
      }),
    );
    // mapObject(object, async (value, key) => {
    //
    // });
    this.private(false);
    return object;
  }


  // Рекурсивный поиск на всю глубину и загрузка
  async deep(object, regexp, field, isPublic) {
    return Promise.all(
      map(object, (value, key) => {
        if (isString(value)) {
          return this.touch(object, value, key, regexp, field, isPublic);
        }
        if (isArray(value) && !isEmpty(value)) {
          if (isString(value[0])) {
            this.touch(object, value, key, regexp, field, isPublic);
          } else {
            return  this.deep(value, regexp, field, isPublic);
          }
        }
        if (isObject(value)) {
          return  this.deep(value, regexp, field, isPublic);
        }
      }),
    );


    // mapObject(object, async (value, key) => {
    //
    // });

    this.private(false);
    return object;
  }


  // Простое раскрытие по индексу
  async expand(object, field, regexp, isPublic) {
    let target = object[field];
    if (isArray(target) && !isEmpty(target)) {
      object[field] = await this.list(target, regexp, isPublic);
    } else
    if (object[field]) {
      object[field] = await this.relation(target, regexp, isPublic);
    }
    return;
  }

  // Раскрытие в соотвествии с правилами. Список правил
  async filling(object, rules, defaultRegexp, isPublic) {
    // if (isArray(object) && !isEmpty(object)) {
    //   return Promise.all(
    //     map(object, (value) => {
    //       return this.filling(value, rules, defaultRegexp, isPublic);
    //     }),
    //   );
    // }
    return Promise.all(
      map(rules, (rule) => {
        if (isString(rule)){
          return this.expand(object, rule, defaultRegexp);
        }
        if (isArray(rule) && !isEmpty(rule)) {
          return this.expand(object, rule[0], rule[1] || defaultRegexp);
        }
      }),
    );
  }

  // Раскрытие списка
  async fill(list, rules, defaultRegexp) {
    return Promise.all(
      map(list, (object, index) => {
        return this.filling(object, rules, defaultRegexp, this.isPublic);
      }),
    );
  }
}
