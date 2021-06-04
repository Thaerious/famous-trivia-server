systemctl status nginx
systemctl start nginx
systemctl stop nginx
systemctl restart nginx
systemctl enable nginx
systemctl disable nginx

npx c8 mocha [testname]
npx c8 report -r html
