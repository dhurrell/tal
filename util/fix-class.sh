#!/bin/sh

perl -w -pi -e 'BEGIN{undef $/;} s/(\w+)(:\s*)function(?s)(.+?)this._super\s*\((.*?)\)/$1$2function $1$3$1.base.call(this, $4)/smg' /tmp/cehtml.js
perl -w -pi -e 's/\.base\.call\(this,\s+\)/.base.call(this)/g' /tmp/cehtml.js