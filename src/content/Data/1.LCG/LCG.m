format bank
m = 2^31-1;
a = 7^5;
c = 0;
x0 = 142387;
x = mod(a*x0+c, m);
x1 = x;
counter = 0;
flag = 0;
while (flag == 0)
    x = mod(a*x+c, m);
    counter = counter + 1;
    if x == x1
        flag = 1;
    end
end
%
disp([m counter x]);