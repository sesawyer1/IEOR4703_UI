
m = 2^31-1;
a = 48271;
c = 0;

x = 48271;

n = 10000;


randU = zeros(n,1);
for i = 1:n
    x = mod(a*x+c,m);
    randU(i) = x/(m+1);
end

[N, edges] = histcounts(randU,10);

disp(edges);

disp(N);

