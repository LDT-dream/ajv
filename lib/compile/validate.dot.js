{{# def.definitions }}

{{ /**
    * schema compilation (render) time:
    * it = { schema, RULES, _validate, opts }
    * it.validate - this template function,
    *   it is used recursively to generate code for subschemas
    *
    * runtime:
    * "validate" is a variable name to which this function will be assigned
    * validateRef etc. are defined in the parent scope in index.js
    */ }}

{{? it.isRoot}}
  {{
    var $root = it.isRoot
      , $lvl = it.level = 0
      , $dataLvl = it.dataLevel = 0
      , $data = 'data';
    it.baseId = it.resolve.fullPath(it.schema.id);
    delete it.isRoot;
  }}

  validate = function (data, dataPath) {
    validate.errors.length = 0;
{{??}}
  {{ 
    var $lvl = it.level
      , $dataLvl = it.dataLevel
      , $data = 'data' + ($dataLvl || '');

    if (it.schema.id) it.baseId = it.resolve.url(it.baseId, it.schema.id);
  }}

  var errs{{=$lvl}} = validate.errors.length;
{{?}}

{{
  var $valid = 'valid' + $lvl
    , $breakOnErrors = !it.opts.allErrors
    , $closingBraces1 = ''
    , $closingBraces2 = '';

  var $typeSchema = it.schema.type;
}}

var {{=$valid}} = true;

{{~ it.RULES:$rulesGroup }}
  {{? $shouldUseGroup($rulesGroup) }}
    {{? $rulesGroup.type }}
      if ({{= it.util.checkDataType($rulesGroup.type, $data) }}) {
    {{?}}
      {{~ $rulesGroup.rules:$rule }}
        {{? $shouldUseRule($rule) }}
          {{= $rule.code(it) }}
          {{? $breakOnErrors }}
            if ({{=$valid}}) {
            {{ $closingBraces1 += '}'; }}
          {{?}}
        {{?}}
      {{~}}
      {{? $breakOnErrors }}
        {{= $closingBraces1 }}
        {{ $closingBraces1 = ''; }}
      {{?}}
    {{? $rulesGroup.type }}
      }
      {{? $typeSchema && $typeSchema === $rulesGroup.type }}
        {{ var $typeChecked = true; }}
        else {
          {{=$valid}} = false;
          {{# def.error:'type' }}
        }
      {{?}}
    {{?}}

    {{? $breakOnErrors }}
      if ({{=$valid}}) {
      {{ $closingBraces2 += '}'; }}
    {{?}}
  {{?}}
{{~}}

{{? $typeSchema && !$typeChecked  }}
  {{
    var $schemaPath = it.schemaPath + '.type'
      , $isArray = Array.isArray($typeSchema)
      , $method = $isArray ? 'checkDataTypes' : 'checkDataType';
  }}

  if (!({{= it.util[$method]($typeSchema, $data) }})) {{# def.error:'type' }}
{{?}}

{{? $breakOnErrors }} {{= $closingBraces2 }} {{?}}

{{? $root }}
    return validate.errors.length === 0;
  }
{{??}}
    {{=$valid}} = errs{{=$lvl}} == validate.errors.length;
{{?}}

{{# def.cleanUp }}

{{
  function $shouldUseGroup($rulesGroup) {
    return $rulesGroup.rules.some(function ($rule) {
      return $shouldUseRule($rule);
    });
  }

  function $shouldUseRule($rule) {
    var $use = it.schema[$rule.keyword] !== undefined;
    if (!$use && $rule.keyword == 'properties') {
      var $pProperties = it.schema.patternProperties
        , $aProperties = it.schema.additionalProperties;
      $use = ($pProperties && Object.keys($pProperties).length) ||
             ($aProperties === false || typeof $aProperties == 'object');
    }
    return $use;
  }
}}