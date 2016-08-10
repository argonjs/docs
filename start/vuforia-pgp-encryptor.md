---
layout: page
title: Vuforia PGP Encryptor
permalink: /start/vuforia-pgp-encryptor
nav_order: 23
nav_subpage: 1
---

<script src="https://cdnjs.cloudflare.com/ajax/libs/openpgp/2.3.2/openpgp.js">
</script>

<style>
textarea {
  width: 100%;
  min-height: 150px;
  display: block;
}
</style>

### Vuforia Key
<textarea id="key" placeholder="AXRIsu7/////AAAAAaYn+sFgpkAomH+Z+tK/Wsc8D+x60P90Nz8Oh0J8onzjVUIP5RbYjdDfyatmpnNgib3xGo1v8iWhkU1swiCaOM9V2jmpC4RZommwQzlgFbBRfZjV8DY3ggx9qAq8mijhN7nMzFDMgUhOlRWeN04VOcJGVUxnKn+R+oot1XTF5OlJZk3oXK2UfGkZo5DzSYafIVA0QS3Qgcx6j2qYAa/SZcPqiReiDM9FpaiObwxV3/xYJhXPUGVxI4wMcDI0XBWtiPR2yO9jAnv+x8+p88xqlMH8GHDSUecG97NbcTlPB0RayGGg1F6Y7v0/nQyk1OIp7J8VQ2YrTK25kKHST0Ny2s3M234SgvNCvnUHfAKFQ5KV">
</textarea>

### Allowed Domains
<textarea id="domains" placeholder="mysite.com">
</textarea>

### License Data (JSON)
<textarea id="json">
</textarea>

### License Data (encrypted JSON)
<textarea id="encrypted">
</textarea>

<script>
var hkp = new openpgp.HKP('https://pgp.mit.edu');

var options = {
    query: 'secure@argonjs.io'
};


var keyElement = document.getElementById('key');
var domainsElement = document.getElementById('domains');
var jsonElement = document.getElementById('json')
var encryptedElement = document.getElementById('encrypted')

var pubkey;

function updateLicenseData() {
  var key = keyElement.value;
  var domains = domainsElement.value.split(/\s*[\s,]\s*/);
  
  var json = jsonElement.value = JSON.stringify({
    key: key, 
    domains: domains
  });
  
  var options = {
    data: json,
    publicKeys: pubkey.keys,
  };
  
  openpgp.encrypt(options).then(function(ciphertext) {
      encryptedElement.value = ciphertext.data;
  });
}

hkp.lookup(options).then(function(key) {
    pubkey = openpgp.key.readArmored(key);
    keyElement.addEventListener('input', updateLicenseData);
    domainsElement.addEventListener('input', updateLicenseData);
});

</script>

