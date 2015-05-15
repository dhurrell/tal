(:\s*)function(?s)(.+?)this._super\(\)
\1function f\2f.base.call(this)

(:\s*)function(?s)(.+?)this._super\((.+?)\)
\1function f\2f.base.call(this, \3)



(\w+)(:\s*)function(?s)(.+?)this._super\(\)
\1\2function \1\3\1.base.call(this)

(\w+)(:\s*)function(?s)(.+?)this._super\((.*?)\)
\1\2function \1\3\1.base.call(this, \4)

.base.call\(this,\s+\)
.base.call(this)