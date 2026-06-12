#include<bits/stdc++.h>
using namespace std;

int main(){
    int t;
    cin>>t;
    while(t--){
        int n,k;
        cin>>n>>k;
        String str;
        cin>>str;

        cin>>n;
        vector<int> height(n);
        for(int i=0;i<n;i++) cin>>height[i];
        auto [mn,mx]=minmax_element(height.begin(),height.end());
        cout<<((*mx)+1)-(*mn)<<"\n";
    }
    return 0;
}