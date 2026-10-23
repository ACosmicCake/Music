package io.github.acosmiccake.worldwoodshed;

import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.ViewGroup;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (bridge == null) return;
        // The page runs in its own process, which Android may end when the phone is short of memory (most
        // often while the app is in the background) or which may crash. Left alone, that closes the whole
        // app. Instead, throw the dead page away and start it again: progress is saved on the device as you go.
        bridge.addWebViewListener(new WebViewListener() {
            @Override
            public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                Log.w("WorldWoodshed", "The page's process ended (" + (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && detail.didCrash() ? "crashed" : "out of memory") + "); starting it again");
                if (view.getParent() instanceof ViewGroup) ((ViewGroup) view.getParent()).removeView(view);
                view.destroy();
                recreate();
                return true;
            }
        });
    }
}
